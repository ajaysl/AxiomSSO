import Account from "./account.js";
import MongoAdapter from "../Adapter/mongo.js";

const resourceInfo = async (ctx, resourceIndicator, client) => {
  const resource = await MongoAdapter.coll("resource").findOne({
    resourceIndicator,
    clientId: client.clientId,
  });
  if (!resource) return ctx.throw(404, "Resource not found");
  return {
    scope: resource.scope,
    accessTokenTTL: resource.accessTokenTTL,
    accessTokenFormat: resource.accessTokenFormat,
  };
};
const configuration = {
  clients: [],
  findAccount: Account.findAccount,
  interactions: {
    url(ctx, interaction) {
      // eslint-disable-line no-unused-vars
      return `/authenticate/${interaction.uid}`;
    },
  },
  cookies: {
    keys: [
      "somkjbm",
      "and also the old rotated away some time ago",
      "and one more",
    ],
  },
  pkce: {
    required: () => false,
  },

  routes: {
    authorization: "/authorize",
    backchannel_authentication: "/backchannel",
    code_verification: "/device",
    device_authorization: "/device/auth",
    end_session: "/session/end",
    introspection: "/token/introspection",
    jwks: "/jwks",
    pushed_authorization_request: "/request",
    registration: "/registration",
    revocation: "/token/revocation",
    token: "/token",
    userinfo: "/userinfo",
  },

  claims: {
    address: ["address"],
    email: ["email", "email_verified"],
    phone: ["phone_number", "phone_number_verified"],
    profile: [
      "name",
      "family_name",
      "given_name",
      "middle_name",
      "nickname",
      "preferred_username",
      "profile",
      "picture",
      "website",
      "gender",
      "birthdate",
      "zoneinfo",
      "locale",
      "updated_at",
    ],
    openid: ["sub", "auth_time", "acr"],
  },
  clientDefaults: {
    grant_types: ["authorization_code", "refresh_token"],
    token_endpoint_auth_method: "client_secret_post",
    response_types: ["code"],
  },
  features: {
    userinfo: { enabled: true },
    devInteractions: { enabled: false }, // defaults to true
    backchannelLogout: { enabled: true },
    deviceFlow: { enabled: false }, // defaults to false
    revocation: { enabled: true }, // defaults to false
    introspection: { enabled: true },
    jwtIntrospection: { enabled: true },
    clientCredentials: { enabled: true },
    registration: { enabled: true },
    resourceIndicators: {
      enabled: true,
      getResourceServerInfo: resourceInfo,
      useGrantedResource: () => true,
    },
  },

  alwaysIssueRefresh: true,
  async issueRefreshToken(ctx, client, code) {
    if (!client.grantTypeAllowed("refresh_token")) {
      return false;
    }

    return (
      code.scopes.has("offline_access") ||
      (client.applicationType === "web" &&
        client.tokenEndpointAuthMethod === "client_secret_post")
    );
  },

  ttl: {
    AccessToken: 1 * 24 * 60 * 60,
    AuthorizationCode: 1 * 24 * 60 * 60,
    IdToken: 1 * 24 * 60 * 60,
    Session: 2 * 60,
    RefreshToken: 1 * 24 * 60 * 60,
    Grant: 1 * 24 * 60 * 60,
    Interaction: 2 * 60,
  },
  jwks: {
    keys: [
      {
        p: "z2ZvAedP21cwNShvECMrrMTNS5jYZy0VP0MTBZN0IAqE2lCaGbY0jwcrH0Pfhk6I8hH5B1SgNrjgqmFU8_QO8yvwV0ah1DC97gU5yCkLWYk4mQLYb7O9KBk3AhmbaABevVZ_2eaC0oErX9YX_vyAIT7TnpE7P9xaN1zXhV9pCQM",
        kty: "RSA",
        q: "stu_oh1XXH70Bn6ZlA8kCZGJXxqKg3Pu_QP2DhJXatZ4JGN2ZhpdmjseSvpsEvHnfoqZmvVufOQOgNKK_iHytwHKDxXLQLmX-WKkanonoqcHAxc5C8htY4wLE9vSYzP6kXvIv4zBxShT6B_xv30II-zBREO3qool5S7J7Tku9h0",
        d: "LVLYLFAdyMVz8BHMnMyvyOJKwQNc7Lc5kQ_blKppxmaKUf-bt-V3qywIYXRCqfL9-xiZLdndmJRDvsvjIa6COJO08Ww4OyvCk9mAuQO-Qsi7Zhq5SDUEsY4NDP6HnZ1eRAvxlboOBbIycOtu8WGXQysLCgU2jmbnG4sQ5hid_Y1n2BICnivKNZFeQ6nKMfhwRgUDkuzynb5B-bOp1uscIR8B5d0M6ktuWXqC2aCZuhKccoOOhGHGD5LIwySbpNRMWKIuVaU_eT_aD3unJVvewUhkcLIFAdA44guPUblg6GD9LLezjiZROIbEs-CANLdzM99DQHbZvltZFbmWv_m8KQ",
        e: "AQAB",
        use: "sig",
        qi: "UqVUKkrqUtzDu8ncD-YSzrwhrRCE5fyHf4G9qrvBeqLuJumtuU_C5HYGeCT3yA60T-J84zlY6ultPYUbb7zIAS6qwJKbff_NrFnHeRGSTAwmZ1BSRj1xg3HQkEI-GEpy6XWh4hwzXj8_tsQUNgT-5KBjbGZV5kld2pyijlKe-1g",
        dp: "WHeWNFapvqMTQimMLnMCJ0EPXQbGkEQvwvtmesNqDlzOTJ2DDiKlirkBEOYPy6dmTPOTqSfU62KzGppH9YOOePWuIFxVnUBpU8VQ32t6luesh8Ap-IPP1PHkf_XST2uQ_eyOvrDP7uEAUnHtbGvib8vv0ryabGQe62yj1hVbpWc",
        alg: "RS256",
        dq: "heQC3LTiRRe0TXhQN4nuDEuqbktMDYOoEDf65iXM0umiHntmkqCCGYbP8ojshnIYPZ47xsib4VpHkSALdJqtO1pXjFtgQB-vKL0zH5I6QYSPtzyXM77iRHb9g-w23pR2qpnjeaFBHPpHdakUK6jJgzskopme0EeCfsI73x3DjfE",
        n: "kOdBEQzgc-7TJeyNM5S086Zg7SgMsHAsqYKzA_Vwt9VZPIfLpHMjQ0V3q4lPxCBRs0dGWlRKNjKume13XxHepP77gXteZG6E8mBK9kCbIz4B29XIEEN_preWVgo5H7IFVnW8dWL3sS0FvwI71GWp6hL8J4Q416sMNO2Vyb6JbLXCUUqV-8Q7wydj9yj8D-BRku-YR5Fkhkb7hkjmONh0w8eR2k2m-5KoALIlnwlDvU13YcPQTu55e9m69-XGa2BncI9qEWP3dh9YjhECLr6xxZybh0kDvnhU_-RglJ1rg-YVjvHLvT9qE9LLQoUH2__IhwPcEnsHidgCrs5zBxjnVw",
      },

      {
        kty: "EC",
        d: "KFE99LBBS7L3t011li-sZ1aXUzdntR53kWUAsodK10c",
        use: "sig",
        crv: "P-256",
        x: "W2g8zLa8VwT1hSvgfDTlRbOZ6Z3bUY5YyElQ-k4ZLSQ",
        y: "8NQKDPisrcCqzYf8btCjDCBcs25qxNffjFKj3y3qef8",
        alg: "ES256",
      },

      {
        kty: "OKP",
        d: "q8_FCYQapew8mnq_POyQBAbcPcj5L9QzQVHFYJp9-QE",
        use: "sig",
        crv: "Ed25519",
        x: "99r1kkNs9_8WZwM-sU_9pldPWH_PqiYzPOmxYB9V5cQ",
        alg: "EdDSA",
      },
    ],
  },
};

export default configuration;
