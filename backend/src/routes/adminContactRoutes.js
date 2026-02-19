// src/routes/adminContactRoutes.js
import express from "express";
import {
  getContactInfo,
  updateContactInfo,
} from "../controllers/adminContactController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getContactInfo);
router.put("/", updateContactInfo);

export default router;
