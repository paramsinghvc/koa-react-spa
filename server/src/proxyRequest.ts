import Koa from "koa";
import request from "request-promise-native";
import { StatusCodeError } from "request-promise-native/errors";
import { CoreOptions } from "request";
import Router from "koa-router";

import { logger } from "./logger";

export type KoaContext = Koa.ParameterizedContext<
  any,
  Router.IRouterParamContext<any, {}>
>;
export type UrlResolutionFunction = (
  req: Koa.Request,
  ctx?: KoaContext
) => string;
export type ProxyRequestOptions = {
  url: string | UrlResolutionFunction;
  requestOptionsDecorator?: (req: Koa.Request) => { [k: string]: any };
  responseDecorator?: (
    res: Koa.Response,
    actualRes: request.FullResponse
  ) => void;
  responseHeadersWhitelist?: Array<string>;
  sendSessionCookie?: boolean;
  clearSessionCookie?: boolean;
};

const isUrlResolutionFunction = (
  url: ProxyRequestOptions["url"]
): url is UrlResolutionFunction => typeof url !== "string";

const defaultResponseHeadersWhitelist = ["content-type", "content-length"];
export const proxyRequest = ({
  url,
  requestOptionsDecorator,
  responseDecorator,
  responseHeadersWhitelist = ["content-type"],
  sendSessionCookie = false,
  clearSessionCookie = false
}: ProxyRequestOptions) =>
  async function(ctx: KoaContext) {
    const { request: req, response: res, cookies } = ctx;
    try {
      const resolvedUrl = isUrlResolutionFunction(url) ? url(req, ctx) : url;
      const requestOptions: CoreOptions & {
        resolveWithFullResponse?: boolean;
      } = {
        method: req.method,
        headers: req.headers,
        strictSSL: false,
        resolveWithFullResponse: true,
        gzip: true,
        ...(requestOptionsDecorator ? requestOptionsDecorator(req) : {})
      };

      try {
        const { host = req.host } = new URL(resolvedUrl);
        requestOptions.headers.host = host;
      } catch (e) {
        logger.error("Error determining the host from URL", {
          resolvedUrl,
          error: e
        });
      }

      requestOptions.headers["accept-encoding"] = "gzip";

      /* For setting the cookie on the client

      if (sendSessionCookie && cookie && cookie.session) {
        const cookieJar = request.jar();
        cookieJar.setCookie("session", cookie.session);
        requestOptions.jar = cookieJar;
      }

      */

      if (clearSessionCookie) {
        cookies.set("session", null);
      }

      logger.debug("Client Request", {
        clientRequest: req
      });

      const actualResponse = await request(resolvedUrl, requestOptions);
      if (actualResponse) {
        const {
          statusCode,
          statusMessage,
          body,
          headers,
          request
        } = actualResponse;
        logger.info("Upstream Server Response Received", {
          statusCode,
          statusMessage,
          upstreamServerRequest: request,
          headers
        });

        res.status = statusCode;
        res.message = statusMessage;

        defaultResponseHeadersWhitelist
          .concat(responseHeadersWhitelist)
          .forEach(responseHeader => {
            if (headers[responseHeader]) {
              res.set(responseHeader, headers[responseHeader]);
            }
          });

        res.body = body;
        responseDecorator && responseDecorator(res, actualResponse);
      } else {
        logger.error("Upstream server Response is empty! Returning 204");
        res.status = 204;
      }
    } catch (error) {
      console.error(error);
      logger.error("Error in the API call", {
        error
      });
      const {
        statusCode = 204,
        error: errorBodymessage
      } = error as StatusCodeError;
      res.status = statusCode;
      res.body = errorBodymessage;
    }
  };
