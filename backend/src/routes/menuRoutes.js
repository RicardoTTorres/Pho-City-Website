// src/routes/menuRoutes.js
import { Router } from "express";
import {
  getMenu,
  getAdminMenu,
  getFeaturedItems,
  addCategory,
  editCategory,
  deleteCategory,
  addItem,
  editItem,
  deleteItem,
  reorderCategories,
  reorderCategoryItems,
} from "../controllers/menuController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { generateMenuPdf } from "../services/menuPdfService.js";

const router = Router();

router.get("/pdf", async (req, res) => {
  try {
    const buffer = await generateMenuPdf();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="pho-city-menu.pdf"',
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

router.get("/", getMenu);
router.get("/featured", getFeaturedItems);
router.get("/admin", requireAuth, getAdminMenu);

router.post("/categories", requireAuth, addCategory);
router.put("/categories/reorder", requireAuth, reorderCategories);
router.put("/categories/:id", requireAuth, editCategory);
router.delete("/categories/:id", requireAuth, deleteCategory);

router.post("/items", requireAuth, addItem);
router.put("/items/:id", requireAuth, editItem);
router.delete("/items/:id", requireAuth, deleteItem);

router.put(
  "/categories/:categoryId/items/reorder",
  requireAuth,
  reorderCategoryItems,
);

export default router;
