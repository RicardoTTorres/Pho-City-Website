// src/routes/contactRoutes.js
import express from "express";
import { handleContactForm } from "../controllers/contactController.js";
import { getContactInfo } from "../controllers/adminContactController.js";

const router = express.Router();

router.get("/", getContactInfo);
router.post("/", handleContactForm);

export default router;
