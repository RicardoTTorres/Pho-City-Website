import express from "express";
import { getHero, updateHero } from "../controllers/heroController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", getHero);
router.put("/", requireAuth, updateHero);

export default router;
