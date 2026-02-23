// src/routes/settingsRoutes.js
import express from "express";
import {
  handleGetSettings,
  handleSaveSettings,
  handleGetPublicSettings,
  handleGetInbox,
  handleMarkRead,
} from "../controllers/settingsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/public", handleGetPublicSettings);

// Admin-only
router.get("/", requireAuth, handleGetSettings);
router.put("/", requireAuth, handleSaveSettings);
router.get("/inbox", requireAuth, handleGetInbox);
router.patch("/inbox/:id/read", requireAuth, handleMarkRead);

export default router;
