import express from "express";
import {getFooter} from "../controllers/footerController.js";

const router = express.Router();

router.get("/", getFooter);

export default router;