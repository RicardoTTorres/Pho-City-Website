import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import contactRoutes from "./routes/contactRoutes.js";
import adminContactRoutes from "./routes/adminContactRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import footerRoutes from "./routes/footerRoutes.js";
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menuRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import adminUsersRoutes from "./routes/adminUsersRoutes.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Logs all requests for debugging purposes
app.use((req, res, next) => {
  const origin = req.get("Origin") || "(none - same-origin/proxied request)";
  console.log(
    "Incoming request:",
    req.method,
    req.url,
    "Origin:",
    origin,
  );
  next();
});

app.use(express.json());
app.use(cookieParser());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
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
app.use("/api/menu", menuRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/footer", footerRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("Hi from server!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
