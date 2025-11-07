import { Router } from "express";
import { getMenu, getAdminMenu, addCategory, editCategory, deleteCategory, addItem, editItem, deleteItem } from "../controllers/menuController.js";

const router = Router();

router.get("/", getMenu);
router.get("/admin", getAdminMenu);
router.post("/categories", addCategory);
router.put("/categories/:id", editCategory);
router.delete("/categories/:id", deleteCategory);
router.post("/items", addItem);
router.put("/items/:id", editItem);
router.delete("/items/:id", deleteItem);

export default router;