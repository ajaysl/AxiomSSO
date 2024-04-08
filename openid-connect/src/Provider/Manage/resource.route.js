import express from "express";
const router = express.Router();
import MongoAdapter from "../../Adapter/mongo.js";
import validUrl from "valid-url";
import { nanoid } from "nanoid";

router.get("/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const resource = await MongoAdapter.coll("resource")
      .find({
        clientId: clientId,
      })
      .toArray();

    res.json(resource);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { scope, resourceIndicator, clientId } = req.body;

    if (!scope || typeof scope !== "string") {
      return res.status(400).send({ message: "Scope is not valid" });
    }

    if (!resourceIndicator || !validUrl.isUri(resourceIndicator)) {
      return res.status(400).send({
        message: "Resource indicator is not valid",
      });
    }
    if (!clientId) {
      return res.status(400).send({
        message: "Client id is not valid",
      });
    }

    const client = await MongoAdapter.coll("client").findOne({ _id: clientId });
    if (!client) {
      return res.status(404).send({
        message: "Client not found",
      });
    }

    const resource = await MongoAdapter.coll("resource").findOne({
      resourceIndicator,
      clientId,
    });
    if (resource) {
      return res.status(400).send({
        message: "Resource already exists",
      });
    }

    const data = {
      resourceId: nanoid(),
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    await MongoAdapter.coll("resource").insertOne(data);
    return res.status(200).send({
      message: "Resource created successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;
  if (!resourceId) {
    return res.status(400).send({ message: "Resource id is not valid" });
  }
  try {
    await MongoAdapter.coll("resource").deleteOne({
      resourceId,
    });

    return res.json({
      message: "resource deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
