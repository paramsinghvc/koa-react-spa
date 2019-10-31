import request, { RequestPromise } from "request-promise-native";
import jwt from "jsonwebtoken";

import { GOOGLE, AZURE } from "./config";

export type ConfigOptions = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  auth_url: string;
  scope?: string;
  token_url: string;
  access_type?: "online" | "offline";
};
export interface IOAuth {
  config: ConfigOptions;
  getAuthURL: (options: GetAuthUrlOptions) => string;
  getTokenFromCode: (code: string) => Promise<{ response?: any; error?: any }>;
}

export type GetAuthUrlOptions = {
  login_hint?: string;
  scope?: string;
  prompt?: "consent" | "none" | "select_account";
  response_mode?: "query" | "fragment" | "form_post";
  code_challenge_method?: string;
  code_challenge?: string;
  state?: string;
};

export class OAuth implements IOAuth {
  config: ConfigOptions;
  tokenResponse: { [k: string]: any };

  constructor(options: ConfigOptions) {
    this.config = options;
  }

  generateNonce() {
    return Math.random()
      .toString(36)
      .substring(7);
  }

  getAuthURL({
    login_hint,
    scope,
    prompt,
    response_mode,
    code_challenge,
    code_challenge_method,
    state
  }: GetAuthUrlOptions) {
    const { auth_url: AUTH_URL, client_id, redirect_uri } = this.config;
    const queryParams = [
      `client_id=${client_id}`,
      `response_type=code`,
      `scope=${scope || this.config.scope}`,
      `redirect_uri=${redirect_uri}`,
      `nonce=${this.generateNonce()}`,
      login_hint && `login_hint=${login_hint}`,
      prompt && `prompt=${prompt}`,
      response_mode && `response_mode=${response_mode}`,
      state && `state=${state}`,
      code_challenge_method && `code_challenge_method=${code_challenge_method}`,
      code_challenge && `code_challenge=${code_challenge}`
    ]
      .filter(Boolean)
      .join("&");
    return `${AUTH_URL}?${queryParams}`;
  }

  async getTokenFromCode(code: string) {
    const {
      client_id,
      client_secret,
      redirect_uri,
      access_type,
      token_url
    } = this.config;
    try {
      const response = await request
        .post(token_url, {
          resolveWithFullResponse: true
        })
        .form({
          code: code,
          client_id,
          client_secret,
          redirect_uri,
          access_type: access_type || "online",
          grant_type: "authorization_code"
        });
      this.tokenResponse = response;
      return { response };
    } catch (e) {
      return { error: e };
    }
  }

  refreshToken() {
    const { client_id, client_secret, access_type, token_url } = this.config;
    if (access_type === "offline" && this.tokenResponse) {
      return request.post(token_url).form({
        client_id,
        client_secret,
        refresh_token: this.tokenResponse.refresh_token,
        grant_type: "refresh_token"
      });
    }
  }

  parseResponse(response: string) {
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error(`Error parsing the response json: `, e);
    }
  }
  parseJWTToken(token: string) {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (e) {
      console.error(e);
    }
  }
}

export class GoogleOAuth extends OAuth {
  constructor(options: Partial<ConfigOptions> & { redirect_uri: string }) {
    super({
      client_id: GOOGLE.CLIENT_ID,
      client_secret: GOOGLE.CLIENT_SECRET,
      auth_url: GOOGLE.AUTH_URL,
      token_url: GOOGLE.TOKEN_URL,
      ...options
    });
  }
}

export class AzureOAuth extends OAuth {
  constructor(options: Partial<ConfigOptions> & { redirect_uri: string }) {
    super({
      client_id: AZURE.CLIENT_ID,
      client_secret: AZURE.CLIENT_SECRET,
      auth_url: AZURE.AUTH_URL,
      token_url: AZURE.TOKEN_URL,
      ...options
    });
  }
}
