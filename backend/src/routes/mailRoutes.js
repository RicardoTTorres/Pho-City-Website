import { Router } from "express";
import {
    getState, createAuthUrl, finishAuth, getThreads, getThread, markRead, markUnread, reply
} from "../controllers/mailController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/oauth/state", requireAuth, getState);
router.get("/oauth/init", requireAuth, createAuthUrl);
router.get("/oauth/callback", requireAuth, finishAuth);
router.get("/threads", requireAuth, getThreads);
router.get("/threads/:id", requireAuth, getThread);
router.post("/threads/:id/read", requireAuth, markRead);
router.post("/threads/:id/unread", requireAuth, markUnread);
router.post("/threads/:id/reply", requireAuth, reply);

export default router;