import Koa from "koa";
import Router from "koa-router";
import * as URLS from "../../src/shared/config";

import { proxyRequest, ProxyRequestOptions, KoaContext } from "./proxyRequest";

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
      url: URLS.API_HOST + "api/login",
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

export default apiRouter;
