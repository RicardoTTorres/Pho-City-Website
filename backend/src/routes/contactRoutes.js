// src/routes/contactRoutes.js
import express from "express";
import { sendUserMessage } from "../controllers/mailController.js";
import { getContactInfo } from "../controllers/adminContactController.js";

const router = express.Router();

router.get("/", getContactInfo);
router.post("/", sendUserMessage);

export default router;
