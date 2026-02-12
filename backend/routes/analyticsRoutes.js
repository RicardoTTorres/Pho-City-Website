import { Router } from "express";
import { getTraffic, postTraffic } from "../controllers/analyticsController.js";

const router = Router();

router.get("/traffic", getTraffic); // for admin, gets all graphs and stats
router.post("/traffic", postTraffic); // users post when they view pages so their traffic can be logged

export default router;
