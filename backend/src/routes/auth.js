import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/connect_db.js";
import {
  blacklistToken,
  isTokenBlacklisted,
  JWT_SECRET,
  requireAuth,
} from "../middleware/requireAuth.js";

const router = express.Router();

const ADMIN_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const seedEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@phocity.com";
const seedPassword = process.env.ADMIN_DEFAULT_PASSWORD || "changeme";

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 2,
};

function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

async function ensureAdminTableAndSeed() {
  await pool.query(ADMIN_TABLE_SQL);

  const [rows] = await pool.query(
    "SELECT id FROM admins WHERE email = ? LIMIT 1",
    [seedEmail],
  );

  if (rows.length > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(seedPassword, 10);
  await pool.query(
    "INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'admin')",
    [seedEmail, passwordHash],
  );
  console.log(`Seeded default admin user: ${seedEmail}`);
}

await ensureAdminTableAndSeed();

router.get("/login", (_req, res) => {
  res.send("Login endpoint is POST /api/admin/login with JSON body.");
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [rows] = await pool.query(
      "SELECT id, email, password_hash, role FROM admins WHERE email = ? LIMIT 1",
      [email],
    );
    const admin = rows[0];
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signAccess({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    res.cookie("auth", token, cookieOptions);
    return res.json({ ok: true });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

router.get("/verify", (req, res) => {
  try {
    const token = req.cookies?.auth;
    if (!token || isTokenBlacklisted(token)) {
      return res.status(200).json({ ok: false });
    }

    jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ ok: true });
  } catch (_err) {
    return res.status(200).json({ ok: false });
  }
});

router.post("/update-password", requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    const email = req.user?.email;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [rows] = await pool.query(
      "SELECT id, password_hash FROM admins WHERE email = ? LIMIT 1",
      [email],
    );
    const admin = rows[0];
    if (!admin) {
      return res.status(404).json({ error: "User not found" });
    }

    const oldPasswordMatches = await bcrypt.compare(
      oldPassword,
      admin.password_hash,
    );
    if (!oldPasswordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE admins SET password_hash = ? WHERE id = ?", [
      newPasswordHash,
      admin.id,
    ]);

    return res.json({ ok: true, updated: true });
  } catch (err) {
    console.error("update-password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  const token = req.cookies?.auth;
  blacklistToken(token);

  res.clearCookie("auth", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
  return res.json({ ok: true });
});

export default router;
