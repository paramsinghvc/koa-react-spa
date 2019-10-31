/* eslint-disable require-atomic-updates */
/* eslint-disable no-console */
import Koa from "koa";
import bodyParser from "koa-body";
import cookieParser from "koa-cookie";
// import serve from "koa-static";
import userAgent from "koa-useragent";
import chalk from "chalk";
import path from "path";
import figlet from "figlet";
import Train from "figlet/importable-fonts/Train";

import { morganMiddleware, logger } from "./src/logger";
import apiRouter from "./src/apiRouter";
/** Setting global request timeout to 30 seconds  */
const GLOBAL_REQUEST_TIMEOUT = 30000;
const FRONTEND_APP_BUILD_PATH = path.resolve(__dirname, "../../build");

const app = new Koa();
function getFormattedUA(
  userAgent: { [k: string]: any },
  whitelist: Array<string>
) {
  if (!userAgent) return {};
  return Object.entries(userAgent).reduce((acc, [key, value]) => {
    if (whitelist.includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

app.use(bodyParser());
app.use(cookieParser());
app.use(async (ctx, next) => {
  await userAgent(ctx, next);
  ctx.formattedUA = getFormattedUA(ctx.userAgent, [
    "os",
    "platform",
    "version",
    "browser",
    "isMobile",
    "isDesktop"
  ]);
});

/* Adding Middlewares for logging */
app.use(morganMiddleware);
// app.use(winstonLoggerMiddleware);

/** Serve React app build folder */
// app.use(serve(FRONTEND_APP_BUILD_PATH));

/** Koa Router holding all the api routes, prefixed with /api */
app.use(apiRouter.routes());

/** Rewrite Cycle or History Api fallback for Single Page UI Applications
 * Works by catching the unresolved/unmatched routes and redirecting them to
 * index.html of the frontend app to get resolved through client side navigation eg: React-Router
 */
// app.use(
//   async (ctx, next) =>
//     await serve(FRONTEND_APP_BUILD_PATH)(
//       Object.assign(ctx, { path: "index.html" }),
//       next
//     )
// );

const PORT = process.env.PORT || "8082";

/** Figlet ASCII Avatar on initial load
 * Font Options: Train, Arrows, Red Phoenix, Tinker-Toy  */
figlet.parseFont("Train", Train);
figlet("Koa Server", { font: "Train" }, function(err, data) {
  if (err) {
    console.error("Figlet: ", err);
    return;
  }
  console.log(chalk.hex("#ff7675").bold(data));
});

const server = app.listen(PORT, () => {
  console.log(
    chalk.bold.cyanBright(
      `\n\n\n🚀  Node Server running at http://localhost:${PORT}.\n\n\n`
    )
  );
});

// process.on("uncaughtException", function(error) {
//   logger.warn("!!!!!!!!!!!!!!!!!!!!!! uncaughtException !!!!!!!!!!!!!!!!!!!", {
//     error
//   });
// });

server.setTimeout(GLOBAL_REQUEST_TIMEOUT);
