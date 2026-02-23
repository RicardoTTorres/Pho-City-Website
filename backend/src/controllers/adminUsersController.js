// src/controllers/adminUsersController.js
import bcrypt from "bcrypt";
import { pool } from "../db/connect_db.js";

const ALLOWED_ROLES = new Set(["admin", "editor"]);

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

export async function getAdminUserById(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const [rows] = await pool.query(
      `
      SELECT id, email, role, created_at
      FROM admins
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    return res.json({ adminUser: rows[0] });
  } catch (err) {
    console.error("Error fetching admin user:", err);
    return res.status(500).json({ error: "Failed to load admin user" });
  }
}

export async function createAdminUser(req, res) {
  try {
    const { email, password, role = "admin" } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = String(role).trim().toLowerCase();
    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO admins (email, password_hash, role)
      VALUES (?, ?, ?)
      `,
      [normalizedEmail, passwordHash, normalizedRole],
    );

    const [rows] = await pool.query(
      `
      SELECT id, email, role, created_at
      FROM admins
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    return res.status(201).json({ adminUser: rows[0] });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Error creating admin user:", err);
    return res.status(500).json({ error: "Failed to create admin user" });
  }
}

export async function updateAdminUser(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const { email, password, role } = req.body || {};
    const updates = [];
    const params = [];

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ error: "Invalid email" });
      }
      updates.push("email = ?");
      params.push(email.trim().toLowerCase());
    }

    if (password !== undefined) {
      if (typeof password !== "string" || !password) {
        return res.status(400).json({ error: "Invalid password" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push("password_hash = ?");
      params.push(passwordHash);
    }

    if (role !== undefined) {
      const normalizedRole = String(role).trim().toLowerCase();
      if (!ALLOWED_ROLES.has(normalizedRole)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      updates.push("role = ?");
      params.push(normalizedRole);
    }

    if (!updates.length) {
      return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id);
    const [result] = await pool.query(
      `
      UPDATE admins
      SET ${updates.join(", ")}
      WHERE id = ?
      `,
      params,
    );

    if (result.affectedRows < 1) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    const [rows] = await pool.query(
      `
      SELECT id, email, role, created_at
      FROM admins
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return res.json({ adminUser: rows[0] });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Error updating admin user:", err);
    return res.status(500).json({ error: "Failed to update admin user" });
  }
}

export async function deleteAdminUser(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (req.user?.id === id) {
      return res.status(400).json({ error: "Cannot delete current user" });
    }

    const [result] = await pool.query(
      `
      DELETE FROM admins
      WHERE id = ?
      `,
      [id],
    );

    if (result.affectedRows < 1) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting admin user:", err);
    return res.status(500).json({ error: "Failed to delete admin user" });
  }
}
