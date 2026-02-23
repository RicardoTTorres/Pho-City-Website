// src/services/settingsService.js
import { pool } from "../db/connect_db.js";

const DEFAULT_SETTINGS = {
  site: {
    siteName: "Pho City",
    tagline: "Authentic Vietnamese Cuisine",
    seoDescription:
      "Experience authentic Vietnamese flavors in Sacramento. Traditional pho, fresh rolls, and modern Vietnamese fusion crafted with passion.",
    googleAnalyticsId: "",
  },
  contact: {
    notificationEmail: "",
    emailNotificationsEnabled: false,
    storeSubmissions: true,
  },
  pdf: {
    menuLabel: "Download Menu",
    cacheTtlMinutes: 60,
  },
};

export async function getSettings() {
  const [rows] = await pool.query(
    "SELECT settings_json FROM site_settings WHERE id = 1",
  );
  if (!rows.length || !rows[0].settings_json) return DEFAULT_SETTINGS;
  // Deep-merge so any new default keys are always present
  const stored = rows[0].settings_json;
  return {
    site: { ...DEFAULT_SETTINGS.site, ...stored.site },
    contact: { ...DEFAULT_SETTINGS.contact, ...stored.contact },
    pdf: { ...DEFAULT_SETTINGS.pdf, ...stored.pdf },
  };
}

export async function saveSettings(settings) {
  await pool.query("UPDATE site_settings SET settings_json = ? WHERE id = 1", [
    JSON.stringify(settings),
  ]);
  return settings;
}

// Inbox helpers
export async function getSubmissions() {
  const [rows] = await pool.query(
    "SELECT id, name, email, message, submitted_at, is_read FROM contact_submissions ORDER BY submitted_at DESC LIMIT 200",
  );
  return rows;
}

export async function markSubmissionRead(id) {
  await pool.query("UPDATE contact_submissions SET is_read = 1 WHERE id = ?", [
    id,
  ]);
}

export async function storeSubmission({ name, email, message, ipHash }) {
  const [result] = await pool.query(
    "INSERT INTO contact_submissions (name, email, message, ip_hash) VALUES (?, ?, ?, ?)",
    [name, email, message, ipHash ?? null],
  );
  return result.insertId;
}
