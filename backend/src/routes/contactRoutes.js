// src/routes/contactRoutes.js
import express from "express";
import { sendUserMessage } from "../controllers/mailController.js";

const router = express.Router();

router.post("/", sendUserMessage);

export default router;
