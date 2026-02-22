import { Router } from "express";
import { getState, createAuthUrl, finishAuth } from "../controllers/mailController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/oauth/state", requireAuth, getState);
router.get("/oauth/init", requireAuth, createAuthUrl);
router.get("/oauth/callback", requireAuth, finishAuth);

export default router;