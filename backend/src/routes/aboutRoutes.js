// src/routes/aboutRoutes.js
import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", getAbout);
router.put("/", requireAuth, updateAbout);
export default router;
