// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import { pool } from "../db/connect_db.js";
import {
  blacklistToken,
  isTokenBlacklisted,
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

// In-memory OTP store for password resets (email -> { code, expiresAt })
const resetOtps = new Map();

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
const authTtlDays = Number(process.env.AUTH_TOKEN_TTL_DAYS) || 30;
const authTtlMs = authTtlDays * 24 * 60 * 60 * 1000;
const authTtlJwt = `${authTtlDays}d`;
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  // In production, frontend/backend can be on different domains.
  // SameSite=None is required for credentialed cross-site requests.
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: authTtlMs,
};

function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: authTtlJwt });
}

export async function ensureAdminTableAndSeed() {
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

// await ensureAdminTableAndSeed();

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
      return res.status(403).json({ ok: false });
    }

    jwt.verify(token, JWT_SECRET);
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
    resetOtps.set(normalizedEmail, { code, expiresAt: Date.now() + 15 * 60 * 1000 });

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
  const entry = resetOtps.get(normalizedEmail);

  if (!entry || entry.code !== String(code) || Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: "Invalid or expired reset code" });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      "UPDATE admins SET password_hash = ? WHERE email = ?",
      [passwordHash, normalizedEmail],
    );

    if (result.affectedRows < 1) {
      return res.status(404).json({ error: "User not found" });
    }

    resetOtps.delete(normalizedEmail);
    return res.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  const token = req.cookies?.auth;
  blacklistToken(token);

  res.clearCookie("auth", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return res.json({ ok: true });
});

export default router;
