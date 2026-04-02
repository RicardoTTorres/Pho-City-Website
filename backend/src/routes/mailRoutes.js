import { Router } from "express";
import {
    getState, createAuthUrl, finishAuth, getThreads, getThread, markRead, markUnread, reply, getSavedThreads, trashThread
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
router.delete("/threads/:id", requireAuth, trashThread);
router.get("/savedthreads", requireAuth, getSavedThreads);

export default router;