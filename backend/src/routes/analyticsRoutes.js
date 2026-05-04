// src/routes/analyticsRoutes.js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getTraffic, postTraffic } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const trafficLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

const router = Router();

router.get("/traffic", requireAuth, getTraffic); // admin analytics dashboard
router.post("/traffic", trafficLimiter, postTraffic); // public traffic event logging

export default router;
