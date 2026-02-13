import { Router } from "express";
import { getMenu, getAdminMenu, addCategory, editCategory, deleteCategory, addItem, editItem, deleteItem } from "../controllers/menuController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", getMenu);
router.get("/admin", requireAuth, getAdminMenu);
router.post("/categories", requireAuth, addCategory);
router.put("/categories/:id", requireAuth, editCategory);
router.delete("/categories/:id", requireAuth, deleteCategory);
router.post("/items", requireAuth, addItem);
router.put("/items/:id", requireAuth, editItem);
router.delete("/items/:id", requireAuth, deleteItem);

export default router;
