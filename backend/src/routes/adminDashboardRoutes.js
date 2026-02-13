import { Router } from "express";
import { getStats } from "../controllers/adminDashboardController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);
router.get("/stats", getStats);

export default router;
