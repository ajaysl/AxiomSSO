import { Provider } from "oidc-provider";
import adapter from "../Adapter/mongo.js";
import config from "./config.js";

export const createProvider = () => {
  const provider = new Provider(process.env.ISSUER, {
    adapter,
    ...config,
  });
  return provider;
};
