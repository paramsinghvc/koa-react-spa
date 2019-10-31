/* eslint-disable require-atomic-updates */
import Koa from "koa";
import Router from "koa-router";
import uuid from "uuid";

import { GoogleOAuth, AzureOAuth } from "./auth";
import * as URLS from "../../src/shared/config";
import { proxyRequest, ProxyRequestOptions, KoaContext } from "./proxyRequest";
import { addOrUpdateUser, findUserWithSession } from "./users";

const apiRouter = new Router({
  prefix: "/api"
});

enum HttpVerb {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete"
}

type RouteConfig = {
  method: HttpVerb;
  path: string;
  proxyOptions: ProxyRequestOptions;
};

const routesConfig: Array<RouteConfig> = [
  {
    method: HttpVerb.GET,
    path: "/users",
    proxyOptions: {
      url: (req: Koa.Request) => {
        return `${URLS.API_HOST}api/users`;
      }
    }
  },
  {
    method: HttpVerb.GET,
    path: "/users/:userId",
    proxyOptions: {
      url: (req: Koa.Request, { params: { userId } }: KoaContext) => {
        return `${URLS.API_HOST}api/users/${userId}?${req.querystring}`;
      }
    }
  },
  {
    method: HttpVerb.POST,
    path: "/users",
    proxyOptions: {
      url: URLS.API_HOST,
      requestOptionsDecorator(req) {
        return {
          formData: req.body
        };
      }
    }
  },
  {
    method: HttpVerb.POST,
    path: "/login",
    proxyOptions: {
      url: `${URLS.API_HOST}api/login`,
      requestOptionsDecorator(req) {
        return {
          form: req.body
        };
      }
    }
  }
];

routesConfig.forEach(({ method, path, proxyOptions }: RouteConfig) => {
  apiRouter[method](path, proxyRequest(proxyOptions));
});

apiRouter.get("/auth-url/:provider", async ctx => {
  switch (ctx.params.provider) {
    case "google": {
      const { login_hint, scope, redirect_uri, prompt, state } = ctx.query;
      const url = new GoogleOAuth({ redirect_uri, scope }).getAuthURL({
        login_hint,
        prompt,
        state
      });
      ctx.response.status = 200;
      ctx.response.body = url;
      return;
    }
    case "azure": {
      const { login_hint, scope, redirect_uri, prompt, state } = ctx.query;
      const url = new AzureOAuth({ redirect_uri, scope }).getAuthURL({
        login_hint,
        prompt,
        state
      });
      ctx.response.status = 200;
      ctx.response.body = url;
      return;
    }
  }
  ctx.response.status = 400;
});

apiRouter.get("/auth-from-code/:provider", async ctx => {
  if (ctx.params.provider === "google") {
    const { code, redirect_uri, scope } = ctx.query;
    const GoogleOAuthInstance = new GoogleOAuth({ redirect_uri, scope });
    const { response, error } = await GoogleOAuthInstance.getTokenFromCode(
      code
    );
    if (response) {
      ctx.response.status = 200;
      const parsedResponse = GoogleOAuthInstance.parseResponse(
        response.body as string
      );
      const decodedResponse = GoogleOAuthInstance.parseJWTToken(
        parsedResponse && parsedResponse.id_token
      );
      if (decodedResponse) {
        const session = uuid();
        addOrUpdateUser({
          emailId: decodedResponse.email,
          tokenInfo: parsedResponse,
          session
        });
        ctx.cookies.set("session", session);
        ctx.response.body = decodedResponse;
      }
    }
    if (error) {
      ctx.response.status = error.statusCode || 500;
      ctx.response.body = error.error;
    }
  }
  if (ctx.params.provider === "azure") {
    const { code, redirect_uri, scope } = ctx.query;
    const AzureOAuthInstance = new AzureOAuth({ redirect_uri, scope });
    const { response, error } = await AzureOAuthInstance.getTokenFromCode(code);
    if (response) {
      ctx.response.status = 200;
      ctx.response.body = response;
    }
    if (error) {
      ctx.response.status = error.statusCode || 500;
      ctx.response.body = error.error;
    }
  }
});

// Protected Route
apiRouter.get("/list", async ctx => {
  if (ctx.cookies) {
    if (ctx.cookies["session"]) {
      if (!findUserWithSession(ctx.cookies["session"])) {
        ctx.response.status = 403;
        return;
      }
      ctx.response.status = 200;
      ctx.response.body = [];
    } else {
      ctx.response.status = 401;
      return;
    }
  }
});

export default apiRouter;
