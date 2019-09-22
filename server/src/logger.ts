import winston, { format, transports } from "winston";
import morgan from "koa-morgan";
import chalk from "chalk";
import path from "path";

const level = process.env.LOG_LEVEL || "debug";

const options = {
  file: {
    level: "debug",
    filename: path.resolve(__dirname, `../logs/koa-app.log`),
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  },
  console: {
    level: "verbose",
    handleExceptions: true,
    json: true,
    colorize: true,
    prettyPrint: true,
    format: format.colorize({ all: true })
  },
  error: {
    level: "error",
    filename: path.resolve(__dirname, `../logs/koa-app-errors.log`),
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }
};

const winstonConfiguration = {
  level,
  exitOnError: false,
  format: format.combine(
    format.timestamp({
      format: "Do MMM YYYY - h:mm:ss A"
    }),
    format.errors({ stack: true }),
    format.json(),
    format.printf(({ timestamp, level, message, ...rest }) => {
      const restString = JSON.stringify(rest, undefined, 4);
      return `[${timestamp}] ${level} - ${message} ${restString}`;
    })
  ),
  transports: [
    new transports.File(options.file),
    new transports.Console(options.console),
    new transports.File(options.error)
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.resolve(__dirname, `../logs/koa-app-exceptions.log`)
    })
  ]
};

export const logger = winston.createLogger(winstonConfiguration);

export const morganMiddleware = async (ctx, next) =>
  await morgan(
    function(tokens, req, res) {
      return [
        "\n\n\n",
        chalk.hex("#ff4757").bold("🍄  Morgan --> "),
        chalk.hex("#34ace0").bold(tokens.method(req, res)),
        chalk.hex("#ffb142").bold(tokens.status(req, res)),
        chalk.hex("#ff5252").bold(tokens.url(req, res)),
        chalk.hex("#2ed573").bold(tokens["response-time"](req, res) + " ms"),
        chalk.hex("#f78fb3").bold("@ " + tokens.date(req, res)),
        chalk.yellow(tokens["remote-addr"](req, res)),
        chalk.hex("#fffa65").bold("from " + tokens.referrer(req, res)),
        chalk.hex("#1e90ff")(
          "\n\nUser-Agent: " + JSON.stringify(ctx.formattedUA, undefined, 4)
        ),
        "\n\n",
        chalk.hex("#00cec9")(
          "Cookies: " + JSON.stringify(ctx.cookie, undefined, 4)
        ),
        "\n\n\n"
      ].join(" ");
    },
    {
      skip(req) {
        return !/^\/api/g.test(req.url);
      }
    }
  )(ctx, next);
