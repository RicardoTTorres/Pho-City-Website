import express from "express";
import { getNavbar, updateNavbar } from "../controllers/navbarController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Public endpoint
router.get("/navbar", getNavbar);

// Admin-only update
router.put("/admin/navbar", requireAuth, requireAdmin, updateNavbar);

export default router;
