import logger from "../../Logger/index.js";
import MongoAdapter from "../../Adapter/mongo.js";

export const getAccessTokenUsingAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;
    const accessToken = await MongoAdapter.coll("access_token")
      .find({
        "payload.accountId": accountId,
      })
      .toArray();

    return res.json(accessToken);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getRefreshTokenUsingAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;
    const accessToken = await MongoAdapter.coll("refresh_token")
      .find({
        "payload.accountId": accountId,
      })
      .toArray();
    return res.json(accessToken);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const deleteAccessTokenUsingJti = async (req, res) => {
  try {
    const { jti } = req.params;
    await MongoAdapter.coll("access_token").deleteOne({ _id: jti });
    return res.json({ message: "access token deleted" });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const deleteRefreshTokenUsingJti = async (req, res) => {
  try {
    const { jti } = req.params;
    await MongoAdapter.coll("refresh_token").deleteOne({ _id: jti });
    return res.json({ message: "access token deleted" });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const revokeAllTokenUsingAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;
    await MongoAdapter.coll("access_token").deleteMany({
      "payload.accountId": accountId,
    });
    await MongoAdapter.coll("refresh_token").deleteMany({
      "payload.accountId": accountId,
    });
    return res.json({ message: "all tokens revoked" });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
};
