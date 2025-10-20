import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000;



//Init Local DB
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}


const db = new Database(path.join(__dirname, "db", "cms.db"));
db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);




const seedEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@phocity.com';
const seedPass  = process.env.ADMIN_DEFAULT_PASSWORD || 'changeme';
const existing  = db.prepare('SELECT id FROM admins WHERE email = ?').get(seedEmail);
if (!existing) {
  const hash = await bcrypt.hash(seedPass, 10);
  db.prepare('INSERT INTO admins(email, hash) VALUES (?, ?)').run(seedEmail, hash);
  console.log(`Seeded admin: ${seedEmail} / ${seedPass}`);
} else {
  console.log(`Admin already exists: ${seedEmail} (no reseed)`);
}


app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send("HI FROM SERVER!")
})

app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
        return res.status(400).json({success: false, error: 'All fields are required' })
    }

    try {
        const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  
        port: 587,
        secure: false,           
        auth: {
            user: process.env.GMAIL_USER,       
            pass: process.env.GMAIL_PASS          
        },
    })

    await transporter.sendMail({
        from:  process.env.GMAIL_USER,                       
        to: process.env.GMAIL_USER,       
        subject: `Contact from ${name}`,
        text: message,
    })

    res.status(200).json({success: true, message : 'Email sent!'})
} catch (err) {
    console.error('Error sending email:', err)
    res.status(500).json({ success: false, error: 'Failed to send email' })
}
})

// quick POST sanity check
app.post("/ping", (req, res) => res.json({ ok: true, got: req.body }));

// optional GET helper so the browser shows something
app.get("/admin/login", (req, res) => {
  res.send("Login endpoint is POST /admin/login. Use a REST client with JSON.");
});



app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const row = db.prepare("SELECT id, hash FROM admins WHERE email = ?").get(email);
  if (!row) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, row.hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: row.id, email }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "2h",
  });
  res.json({ ok: true, token });
});


app.post("/admin/update-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body || {};
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = db.prepare("SELECT id, hash FROM admins WHERE email = ?").get(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE admins SET hash = ? WHERE id = ?").run(newHash, user.id);

    return res.json({ ok: true, updated: true });
  } catch (e) {
    console.error("update-password error:", e);
    res.status(500).json({ error: "server error" });
  }
});


app.listen(PORT, ()=>{
console.log(`Server running on port ${PORT}`)


})