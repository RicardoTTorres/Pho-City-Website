// src/routes/auth.js
import { randomUUID } from "node:crypto";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import { pool } from "../db/connect_db.js";
import {
  blacklistToken,
  JWT_SECRET,
  requireAuth,
} from "../middleware/requireAuth.js";

// 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

// 5 reset requests per hour per IP (prevents email spam)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many reset requests. Please try again in an hour." },
});

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

const TOKEN_BLACKLIST_SQL = `
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti VARCHAR(36) PRIMARY KEY,
  expires_at DATETIME NOT NULL,
  INDEX idx_bl_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const PASSWORD_RESETS_SQL = `
CREATE TABLE IF NOT EXISTS password_resets (
  email VARCHAR(255) PRIMARY KEY,
  code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const seedEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@phocity.com";
const seedPassword = process.env.ADMIN_DEFAULT_PASSWORD || "changeme";

const isProd = process.env.NODE_ENV === "production";
const authTtlDays = Number(process.env.AUTH_TOKEN_TTL_DAYS) || 30;
const authTtlMs = authTtlDays * 24 * 60 * 60 * 1000;
const authTtlJwt = `${authTtlDays}d`;
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: authTtlMs,
};

function signAccess(payload) {
  const jti = randomUUID();
  return {
    token: jwt.sign({ ...payload, jti }, JWT_SECRET, { expiresIn: authTtlJwt }),
    jti,
  };
}

export async function ensureAdminTableAndSeed() {
  // Ensure all auth-related tables exist
  await pool.query(ADMIN_TABLE_SQL);
  await pool.query(TOKEN_BLACKLIST_SQL);
  await pool.query(PASSWORD_RESETS_SQL);

  // Seed default admin if not present
  const [rows] = await pool.query(
    "SELECT id FROM admins WHERE email = ? LIMIT 1",
    [seedEmail],
  );

  if (rows.length === 0) {
    const passwordHash = await bcrypt.hash(seedPassword, 10);
    await pool.query(
      "INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'admin')",
      [seedEmail, passwordHash],
    );
    console.log(`Seeded default admin user: ${seedEmail}`);
  }

  // Warn loudly if the admin is still using the default password
  const [adminRows] = await pool.query(
    "SELECT password_hash FROM admins WHERE email = ? LIMIT 1",
    [seedEmail],
  );
  if (adminRows.length > 0) {
    const usingDefault = await bcrypt.compare("changeme", adminRows[0].password_hash);
    if (usingDefault) {
      console.warn("\n" + "=".repeat(60));
      console.warn("  SECURITY WARNING");
      console.warn("  The admin account is still using the default password.");
      console.warn("  Change it immediately in the CMS under Users.");
      console.warn("=".repeat(60) + "\n");
    }
  }
}

router.get("/login", (_req, res) => {
  res.send("Login endpoint is POST /api/admin/login with JSON body.");
});

router.post("/login", loginLimiter, async (req, res) => {
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

    const { token } = signAccess({
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

router.get("/verify", async (req, res) => {
  try {
    const token = req.cookies?.auth;
    if (!token) return res.status(403).json({ ok: false });

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.jti) {
      const [rows] = await pool.query(
        "SELECT 1 FROM token_blacklist WHERE jti = ? LIMIT 1",
        [decoded.jti],
      );
      if (rows.length > 0) return res.status(403).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch (_err) {
    return res.status(403).json({ ok: false });
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

    const oldPasswordMatches = await bcrypt.compare(oldPassword, admin.password_hash);
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

router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [rows] = await pool.query(
      "SELECT id FROM admins WHERE email = ? LIMIT 1",
      [normalizedEmail],
    );

    // Always return ok to avoid exposing which emails exist
    if (!rows.length) return res.json({ ok: true });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at)`,
      [normalizedEmail, code, expiresAt],
    );

    // Log for dev environments without email configured
    console.log(`[Password Reset] OTP for ${normalizedEmail}: ${code}`);

    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
      });
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: normalizedEmail,
        subject: "Pho City Admin — Password Reset Code",
        text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes. If you did not request this, ignore this email.`,
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [rows] = await pool.query(
      "SELECT code, expires_at FROM password_resets WHERE email = ? LIMIT 1",
      [normalizedEmail],
    );
    const entry = rows[0];

    if (!entry || entry.code !== String(code) || new Date() > new Date(entry.expires_at)) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      "UPDATE admins SET password_hash = ? WHERE email = ?",
      [passwordHash, normalizedEmail],
    );

    if (result.affectedRows < 1) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.query("DELETE FROM password_resets WHERE email = ?", [normalizedEmail]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies?.auth;

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded?.jti && decoded?.exp) {
        await blacklistToken(decoded.jti, decoded.exp);
      }
    } catch {
      // ignore decode errors on logout
    }
  }

  res.clearCookie("auth", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return res.json({ ok: true });
});

export default router;
