// src/server.js
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import contactRoutes from "./routes/contactRoutes.js";
import adminContactRoutes from "./routes/adminContactRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import navbarRoutes from "./routes/navbarRoutes.js";
import footerRoutes from "./routes/footerRoutes.js";
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menuRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import adminUsersRoutes from "./routes/adminUsersRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import mailRoutes from "./routes/mailRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { ensureAdminTableAndSeed } from "./routes/auth.js";
const app = express();
const PORT = process.env.PORT || 5000;

// Security headers — clickjacking (X-Frame-Options), MIME sniffing (X-Content-Type-Options), etc.
// CSP is omitted here because the React SPA handles its own inline scripts/styles.
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Logs all requests for debugging purposes
app.use((req, res, next) => {
  const origin = req.get("Origin") || "(none - same-origin/proxied request)";
  console.log("Incoming request:", req.method, req.url, "Origin:", origin);
  next();
});

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow curl/postman or same-origin requests (no Origin header)
      if (!origin) return cb(null, true);

      if (allowedOrigins.length === 0) return cb(null, true); // fallback: don't block
      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Routes
app.use("/api/contact", contactRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/contact", adminContactRoutes);
app.use("/api/admin/analytics", requireAuth, analyticsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/adminUsers", adminUsersRoutes);
app.use("/api/admin", activityRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api", navbarRoutes);
app.use("/api/admin/mail", mailRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", settingsRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("Hi from server!");
});

async function startServer() {
  try {
    await ensureAdminTableAndSeed();

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running...");
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
}

// added

if (process.env.NODE_ENV !== "test") {
  startServer();
} else {
  await ensureAdminTableAndSeed();
}

export default app;

// added for testing

// commented out for testing
// startServer();
