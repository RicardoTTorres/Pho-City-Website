import { Router } from "express";
import { getTraffic, postTraffic } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/traffic", requireAuth, getTraffic); // admin analytics dashboard
router.post("/traffic", postTraffic); // public traffic event logging

export default router;
