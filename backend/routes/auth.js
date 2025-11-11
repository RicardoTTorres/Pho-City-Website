import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sign } from "crypto";

const router = express.Router();

//BlackListToken function
const blackListToken = new Set();


function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "2h" });
}

// Cookie Options 
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,           
  secure: isProd,          
  sameSite: "lax",         
  path: "/",               
  maxAge: 1000 * 60 * 60 * 2 
};


// protect routes using cookie
function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.auth;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    
    //Check if token is blacklisted
    if (blackListToken.has(token)) {
      return res.status(401).json({ error: "This token is invalidated. Please login again."});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}



//Init Local Db
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const dbDir = path.join(__dirname, "..", "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(path.join(dbDir, "cms.db"));
db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

//User seeding
const seedEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@phocity.com";
const seedPass  = process.env.ADMIN_DEFAULT_PASSWORD || "changeme";
const exists = db.prepare("SELECT id FROM admins WHERE email = ?").get(seedEmail);
if (!exists) {
  const hash = await bcrypt.hash(seedPass, 10);
  db.prepare("INSERT INTO admins(email, hash) VALUES (?, ?)").run(seedEmail, hash);
  console.log(`Seeded admin: ${seedEmail} / ${seedPass}`);
} else {
  console.log(`Admin already exists: ${seedEmail} (no reseed)`);
}


//Login + Update + Logout Password Endpoints
router.get("/login", (req, res) => {
  res.send("Login endpoint is POST /api/admin/login. Use a REST client with JSON.");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const row = db.prepare("SELECT id, hash FROM admins WHERE email = ?").get(email);
  if (!row) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, row.hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAccess({ id: row.id, email });

  //setting authentification cookie
  res.cookie("auth", token, cookieOptions);
  return res.json({ ok: true }); 
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

router.post("/update-password", requireAuth, async (req, res) => {
  try {
    const {oldPassword, newPassword } = req.body || {};
    const email = req.user?.email;
    if (!email || !oldPassword || !newPassword)
      return res.status(400).json({ error: "Missing fields" });

    const user = db.prepare("SELECT id, hash FROM admins WHERE email = ?").get(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE admins SET hash = ? WHERE id = ?").run(newHash, user.id);

    res.json({ ok: true, updated: true });
  } catch (e) {
    console.error("update-password error:", e);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/logout", (_req, res) => {

  //Blacklist the token
  const token = _req.cookies?.auth;
  if (token){
    blackListToken.add(token);
  }

  res.clearCookie("auth", { ...cookieOptions, maxAge: 0 });
  res.json({ ok: true });
});

export default router;
