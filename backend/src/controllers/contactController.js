// src/controllers/contactController.js
import Gmail from "../services/gmailService.js";
import crypto from "crypto";
import { getSettings, storeSubmission } from "../services/settingsService.js";

// In-memory rate limiter: 5 submissions per IP per 15 minutes
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const ipWindowMap = new Map(); // ipHash -> { count, windowStart }

function getRateLimitKey(req) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function isRateLimited(ipHash) {
  const now = Date.now();
  const entry = ipWindowMap.get(ipHash);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    ipWindowMap.set(ipHash, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  return false;
}

export async function handleContactForm(req, res) {
  const { name, email, message, _honeypot } = req.body;

  // Honeypot — bots fill this hidden field; humans leave it blank
  if (_honeypot) {
    return res.status(200).json({ success: true, message: "Message received" });
  }

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  const ipHash = getRateLimitKey(req);
  if (isRateLimited(ipHash)) {
    return res
      .status(429)
      .json({ success: false, error: "Too many requests. Please wait a few minutes." });
  }

  try {
    const settings = await getSettings();
    const { storeSubmissions, emailNotificationsEnabled, notificationEmail } =
      settings.contact;

    // Store in DB if enabled
    if (storeSubmissions) {
      await storeSubmission({ name, email, message, ipHash });
    }

    // Send email notification if enabled
    if (emailNotificationsEnabled) {
      try {
        const gmail = await Gmail.create({auth: false});
        const {authenticated} = await gmail.checkAuth();
        if (authenticated) {
          await gmail.sendMessage({
            to: gmail.email,
            fromName: `${name} via Contact Form`,
            replyTo: email,
            subject: `Message from ${name}`,
            message: `Message from ${name} (${email}) via Pho City Website Contact Form:\n\n${message}`
          });
        }
      } catch (err) {
        console.log("Error sending email notification:", err);
      }
    }

    res.status(200).json({ success: true, message: "Message received!" });
  } catch (err) {
    console.error("Error handling contact form:", err);
    res.status(500).json({ success: false, error: "Failed to process message" });
  }
}
