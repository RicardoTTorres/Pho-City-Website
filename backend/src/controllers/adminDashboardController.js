// src/controllers/adminDashboardController.js
import { pool } from "../db/connect_db.js";

export async function getStats(req, res) {
  try {
    // Count the menu items
    const [menuItemRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM menu_items"
    );
    const numMenuItems = menuItemRows[0].count;

    // Find all (table, column) pairs whose column name contains "image" and "url"
    const dbName = process.env.DB_NAME || "pho_city_db";

    const [rawCols] = await pool.query(
      `
      SELECT TABLE_NAME, COLUMN_NAME
      FROM information_schema.columns
      WHERE table_schema = ?
        AND LOWER(COLUMN_NAME) LIKE '%image%'
        AND LOWER(COLUMN_NAME) LIKE '%url%'
      `,
      [dbName]
    );

    // Normalize row keys
    const cols = rawCols
      .map(r => ({ table: r.TABLE_NAME, col: r.COLUMN_NAME }))
      .filter(x => x.table && x.col);

    // For each matching column, count non-empty values
    let numImages = 0;

    for (const { table, col } of cols) {
      const [rows] = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM \`${table}\`
        WHERE \`${col}\` IS NOT NULL AND TRIM(\`${col}\`) <> ''
        `
      );
      numImages += rows[0].count;
    }

    res.json({ dashboard: { numMenuItems, numImages } });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
}