// src/routes/footerRoutes.js

import express from "express";
import { getFooter, putFooter } from "../controllers/footerController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", getFooter);
router.put("/", requireAuth, putFooter);

export default router;
