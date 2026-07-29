// src/middleware/requireAuth.js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { pool } from "../db/connect_db.js";

if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

// Writes a token's jti to the DB blacklist so it cannot be reused after logout.
// expiresAt is the token's exp claim (Unix seconds) — used to prune old rows.
export async function blacklistToken(jti, expiresAt) {
  if (!jti) return;
  try {
    await pool.query(
      "INSERT IGNORE INTO token_blacklist (jti, expires_at) VALUES (?, ?)",
      [jti, new Date(expiresAt * 1000)],
    );
  } catch (err) {
    console.error("blacklistToken error:", err);
  }
}

async function isTokenBlacklisted(jti) {
  if (!jti) return false;
  try {
    const [rows] = await pool.query(
      "SELECT 1 FROM token_blacklist WHERE jti = ? LIMIT 1",
      [jti],
    );
    return rows.length > 0;
  } catch (err) {
    console.error("isTokenBlacklisted error:", err);
    return false; // fail open — don't lock everyone out on a DB hiccup
  }
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.auth;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.jti && (await isTokenBlacklisted(decoded.jti))) {
      return res.status(401).json({ error: "Token has been invalidated" });
    }

    req.user = decoded;
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export { JWT_SECRET };
