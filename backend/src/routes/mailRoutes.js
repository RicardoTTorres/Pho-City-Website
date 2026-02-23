import { Router } from "express";
import { getState, createAuthUrl, finishAuth, getThreads } from "../controllers/mailController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/oauth/state", requireAuth, getState);
router.get("/oauth/init", requireAuth, createAuthUrl);
router.get("/oauth/callback", requireAuth, finishAuth);
router.get("/threads", requireAuth, getThreads);

export default router;