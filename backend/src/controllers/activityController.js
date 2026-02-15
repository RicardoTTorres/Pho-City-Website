// src/controllers/activityController.js
import { pool } from "../db/connect_db.js";

export async function logActivity(action, section, description, adminEmail) {
  try {
    await pool.query(
      `INSERT INTO activity_log (action, section, description, admin_email)
       VALUES (?, ?, ?, ?)`,
      [action, section, description, adminEmail ?? null]
    );
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function getRecentActivity(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, action, section, description, admin_email, created_at
       FROM activity_log
       ORDER BY created_at DESC
       LIMIT 4`
    );
    return res.json({ activity: rows });
  } catch (err) {
    console.error("getRecentActivity error:", err);
    return res.status(500).json({ error: "Failed to fetch activity" });
  }
}
