import express from "express";
import logger from "../Logger/index.js";
import MongoAdapter from "../Adapter/mongo.js";
import TokenRoute from "./Manage/token.route.js";
import ResourceRoute from "./Manage/resource.route.js";
import cors from "cors";
import helmet from "helmet";

const manage = (app, provider) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(helmet());

  app.use("/token", TokenRoute);
  app.use("/resources", ResourceRoute);

  app.put("/clients/:clientId", async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await provider.Client.find(clientId);
      if (!client) {
        return res.status(404).send("Client not found");
      }

      const fieldsToUpdate = {};
      Object.entries(req.body).forEach(async ([key, value]) => {
        const fieldName = `payload.${key}`;
        fieldsToUpdate[fieldName] = value;
      });

      await MongoAdapter.coll("client").updateOne(
        { _id: clientId },
        {
          $set: {
            ...fieldsToUpdate,
          },
        }
      );

      return res.status(200).send("Client updated");
    } catch (err) {
      logger.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/clients/:clientId", async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await provider.Client.find(clientId);
      if (!client) {
        return res.status(404).json({ error: "client not found" });
      }
      return res.json(client);
    } catch (err) {
      logger.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/clients/:clientId", async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await provider.Client.find(clientId);
      if (!client) {
        return res.status(404).json({ error: "client not found" });
      }
      await MongoAdapter.coll("client").deleteOne({ _id: clientId });
      return res.json(client);
    } catch (err) {
      logger.error(err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/clients", async (req, res) => {
    try {
      const client = await provider.Client.create(req.body);
      return res.json(client);
    } catch (err) {
      logger.error(err.message);
      res.status(500).json({ error: err.message });
    }
  });
};

export default manage;
