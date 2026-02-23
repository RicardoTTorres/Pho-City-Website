import { pool } from "../db/connect_db.js";
import bcrypt from "bcrypt";

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

export async function createAdminUser(req, res) {
  try {
    const {new_email, new_password} = req.body;

    if (!new_email || !new_password) {
      return res
        .status(400)
        .json({message: "Email and password are required."});
    }

    const passwordHash = await bcrypt.hash(new_password, 10);
    await pool.query(
      "INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'admin')",
      [new_email, passwordHash],
    );

    res.json({message: "Created new admin user"});
  } catch (error) {
    console.error("Error creating new admin user:", error);
    res.status(500).json({message: "Internal Server Error"});
  }
}