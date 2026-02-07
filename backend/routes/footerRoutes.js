import { Router } from "express";
import { getFooter, updateFooter } from "../controllers/footerController.js";

const router = Router();

router.get("/", getFooter);
router.put("/", updateFooter);

export default router;
