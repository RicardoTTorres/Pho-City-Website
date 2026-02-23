// src/routes/adminUsersRoutes.js
import express from "express";
import {
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../controllers/adminUsersController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/", getAdminUsers);
router.get("/:id", getAdminUserById);
router.post("/", createAdminUser);
router.put("/:id", updateAdminUser);
router.delete("/:id", deleteAdminUser);
export default router;
