

import express from "express";
import { getFooter } from "../controllers/footerController.js";
import { putFooter } from "../controllers/footerController.js";

const router = express.Router();

router.get("/", getFooter);
router.put("/", putFooter);

export default router;