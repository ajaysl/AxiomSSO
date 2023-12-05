import express from "express";
import MongoAdapter from "./Adapter/mongo.js";
import logger from "./Logger/index.js";
import OpenIdRoute from "./Provider/provider.controller.js";
import manageRoute from "./Provider/manage.controller.js";
import session from "express-session";
import cookieParser from "cookie-parser";
//import RedisAdapter from "./Adapter/redis.adapter.js";
import dotenv from "dotenv";
import { createProvider } from "./Provider/index.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cookieParser());
app.use(
  session({
    secret: "test",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: 600000,
    },
  })
);

(async () => {
  try {
    await MongoAdapter.connect();

    const oidc = createProvider();
    const prod = process.env.NODE_ENV === "production";
    if (prod) {
      app.enable("trust proxy");
      oidc.proxy = true;

      app.use((req, res, next) => {
        if (req.secure) {
          next();
        } else if (req.method === "GET" || req.method === "HEAD") {
          res.redirect(
            url.format({
              protocol: "https",
              host: req.get("host"),
              pathname: req.originalUrl,
            })
          );
        } else {
          res.status(400).json({
            error: "invalid_request",
            error_description: "do yourself a favor and only use https",
          });
        }
      });
    }

    app.use("/oidc", oidc.callback());
    OpenIdRoute(app, oidc);
    manageRoute(app, oidc);

    app.listen(port, () => {
      logger.debug(`Server started on port ${port}`);
    });
  } catch (err) {
    logger.error(err.message);
  }
})();
