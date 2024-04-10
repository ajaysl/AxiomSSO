/* eslint-disable no-console, max-len, camelcase, no-unused-vars */

import { strict as assert } from "assert";
import express from "express"; // eslint-disable-line import/no-unresolved
import logger from "../Logger/index.js";
import Account from "./account.js";

const body = express.urlencoded({ extended: false });
const route = (app, provider) => {
  app.set("view engine", "ejs");

  const {
    constructor: {
      errors: { SessionNotFound },
    },
  } = provider;

  function setNoCache(req, res, next) {
    res.set("Pragma", "no-cache");
    res.set("Cache-Control", "no-cache, no-store");
    next();
  }

  app.get("/authenticate/:uid", setNoCache, async (req, res, next) => {
    try {
      console.log({ req });

      const interaction = await provider.interactionDetails(req, res);

      const { uid, prompt, params, session, lastSubmission } = interaction;

      const client = await provider.Client.find(params.client_id);
      console.log(req.body);
      if (prompt.name === "consent") {
        return res.render("interaction", {
          client,
          axiomUserId: lastSubmission?.login?.axiomUserId || "",
          uid,
          details: prompt.details,
          params,
          title: "Authorize",
        });
      } else if (prompt.name === "login") {
        res.cookie("uid", req.params.uid);
        res.cookie("_interaction", req.cookies["_interaction"]);
        res.cookie("connect.sid", req.cookies["connect.sid"]);
        res.cookie("_interaction.sig", req.cookies["_interaction.sig"]);

        return res.redirect(`${client.requestUris[0]}?requestId=${uid}`);
      }

      return undefined;
    } catch (err) {
      return next(err);
    }
  });

  app.post(
    "/authenticate/:uid/login",
    setNoCache,
    express.urlencoded({ extended: true }),
    async (req, res, next) => {
      try {
        const {
          prompt: { name },
        } = await provider.interactionDetails(req, res);
        console.log("BODY DATA", JSON.stringify(req.body));
        const account = await Account.findByLogin(req.body);

        const result = {
          login: {
            accountId: account.accountId,
            axiomUserId: req?.body?.userid,
            axiomAccountId: req?.body?.accountid,
          },
        };

        const redirectTo = await provider.interactionResult(req, res, result);

        return res.redirect(`${redirectTo}`);
      } catch (err) {
        console.log(err);
        next(err);
      }
    }
  );

  app.post("/authenticate/:uid/logout", setNoCache, async (req, res, next) => {
    try {
      const interaction = await provider.interactionDetails(req, res);

      const {  params,} = interaction;
console.log({params});
      const client = await provider.Client.find(params.client_id);
      console.log({ client})
      if (client) {
        // Invalidate the session
        await provider.interactionFinished(req, res, {
          logout: {
            postLogoutRedirectUri: client.postLogoutRedirectUris[0],
          },
        });

        // Redirect the user to the post-logout URI
        res.redirect(client.postLogoutRedirectUris[0]);
      } else {
        res.status(404).json({ error: "Client not found" });
      }
    } catch (err) {
      next(err);
    }
  });

  app.post(
    "/authenticate/:uid/confirm",
    setNoCache,
    body,
    async (req, res, next) => {
      try {
        console.log("in side confirm", req.body);
        const interactionDetails = await provider.interactionDetails(req, res);

        //console.log({interactionDetails});
        const {
          prompt: { name, details },
          params,
          session: { accountId },
          lastSubmission,
        } = interactionDetails;
        assert.equal(name, "consent");
        console.log({ lastSubmission });
        const axiomUserId = lastSubmission?.login?.axiomUserId || "";
        const axiomAccountId = lastSubmission?.login?.axiomAccountId || "";

        // const User = await OIDCUsers.findOne({ userId: accountId });
        // let grantedResourcesToUser;
        // if (User)
        //   grantedResourcesToUser = User.grantedResources?.map(
        //     (resource) => resource.resourceIndicator
        //   );
        // else grantedResourcesToUser = [];
        let grantedResourcesToUser = [];

        let { grantId } = interactionDetails;

        let grant;

        if (grantId) {
          // we'll be modifying existing grant in existing session
          grant = await provider.Grant.find({
            grantId,
            accountId,
            clientId: params.client_id,
          });
        } else {
          // we're establishing a new grant
          grant = new provider.Grant({
            accountId,
            clientId: params.client_id,
          });
        }

        if (details.missingOIDCScope) {
          grant.addOIDCScope(details.missingOIDCScope.join(" "));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [indicator, scopes] of Object.entries(
            details.missingResourceScopes
          )) {
            //grant.addResourceScope(indicator, scopes.join(" "));
            grant.addResourceScope(indicator, scopes.join(" "));

            // console.log(indicator, scopes);
            // console.log(grantedResourcesToUser);

            // if (grantedResourcesToUser.includes(indicator)) {
            //   grant.addResourceScope(indicator, scopes.join(" "));
            // }
          }
        }

        grantId = await grant.save();

        const consent = {};

        if (!interactionDetails.grantId) {
          // we don't have to pass grantId to consent, we're just modifying existing one
          consent.grantId = grantId;
        }

        const stateParams = {
          axiomUserId,
          axiomAccountId,
          // Add other parameters as needed
        };

        const result = { consent, lastSubmission };
        console.log({ stateParams });

        // Set a cookie with axiomUserId

        res.cookie("axiomUserId", axiomUserId);
        res.cookie("axiomAccountId", axiomAccountId);
        // const finalUser=
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: true,
        });

        // res.send({...interactionDetails})

        //console.log({finalUser});
      } catch (err) {
        next(err);
      }
    }
  );

  app.get("/authenticate/:uid/abort", setNoCache, async (req, res, next) => {
    try {
      const result = {
        error: "access_denied",
        error_description: "End-User aborted interaction",
      };
      await provider.interactionFinished(req, res, result, {
        mergeWithLastSubmission: false,
      });
    } catch (err) {
      next(err);
    }
  });

  app.use((err, req, res, next) => {
    if (err instanceof SessionNotFound) {
      // handle interaction expired / session not found error
      res.send("Session expired");
    }

    next(err);
  });
};

export default route;
