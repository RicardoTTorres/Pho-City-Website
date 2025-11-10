import { pool } from "../db/connect_db.js";

export async function getStats(req, res) {
  try {
    const [menuItemRows] = await pool.query(`
        SELECT COUNT(*) AS count
        FROM menu_items
        `);
    const numMenuItems = menuItemRows[0].count;

    const [menuCategoryRows] = await pool.query(`
        SELECT COUNT(*) AS count
        FROM menu_categories
        `);
    const numMenuCategories = menuCategoryRows[0].count;

    res.json({
      dashboard: {
        numMenuItems,
        numMenuCategories
      }
    });

  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
}