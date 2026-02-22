// src/routes/activityRoutes.js
import { Router } from "express";
import { getRecentActivity } from "../controllers/activityController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/activity", requireAuth, getRecentActivity);

export default router;
