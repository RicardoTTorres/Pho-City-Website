// src/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  handleUpload,
  handleList,
  handleDelete,
} from "../controllers/uploadController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", requireAuth, handleList);
router.post("/", requireAuth, upload.single("file"), handleUpload);
router.delete("/", requireAuth, handleDelete);

export default router;
