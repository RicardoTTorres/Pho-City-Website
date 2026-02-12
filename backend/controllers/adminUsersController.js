import { pool } from "../db/connect_db.js";

// Return a list of admin users from the database.
// This matches the init.sql table name: `admin_users` (lowercase).
export async function getAdminUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT email, password FROM admin_users ORDER BY email ASC`,
    );

    // Always return an array to keep the frontend type consistent.
    return res.status(200).json({ adminUsers: rows ?? [] });
  } catch (err) {
    console.error("GET /api/adminUsers error:", err);
    return res.status(500).json({
      error: "Failed to fetch admin users",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}
