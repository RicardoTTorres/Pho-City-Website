import { pool } from "../db/connect_db.js";

export async function getAdminUsers(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT id, email, role, created_at
      FROM admins
      ORDER BY id ASC;
    `);

    res.json({ adminUsers: rows });
  } catch (err) {
    console.error("Error fetching admin users:", err);
    res.status(500).json({ error: "Failed to load admin users" });
  }
}
