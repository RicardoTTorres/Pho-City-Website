// src/middleware/requireAuth.js
import "dotenv/config";
import jwt from "jsonwebtoken";

export const tokenBlacklist = new Set();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

export function blacklistToken(token) {
  if (token) {
    tokenBlacklist.add(token);
  }
}

export function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.auth;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: "Token has been invalidated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export { JWT_SECRET };
