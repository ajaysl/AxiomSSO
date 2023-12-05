import express from "express";
const router = express.Router();
import {
  getAccessTokenUsingAccountId,
  getRefreshTokenUsingAccountId,
  deleteAccessTokenUsingJti,
  deleteRefreshTokenUsingJti,
  revokeAllTokenUsingAccountId,
} from "./token.service.js";

router.get("/", (req, res) => {
  res.send("Hello World! from token");
});

router.get("/access-token/:accountId", getAccessTokenUsingAccountId);

router.get("/refresh-token/:accountId", getRefreshTokenUsingAccountId);

router.delete("/access-token/:jti", deleteAccessTokenUsingJti);

router.delete("/refresh-token/:jti", deleteRefreshTokenUsingJti);

router.delete("/revoke-all/:accountId", revokeAllTokenUsingAccountId);

export default router;
