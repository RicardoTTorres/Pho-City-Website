// src/controllers/settingsController.js
import {
  getSettings,
  saveSettings,
  getSubmissions,
  markSubmissionRead,
} from "../services/settingsService.js";

// GET /api/settings  (requireAuth)
export async function handleGetSettings(req, res) {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    console.error("Error getting settings:", err);
    res.status(500).json({ success: false, error: "Failed to load settings" });
  }
}

// PUT /api/settings  (requireAuth)
export async function handleSaveSettings(req, res) {
  try {
    const saved = await saveSettings(req.body);
    res.json({ success: true, settings: saved });
  } catch (err) {
    console.error("Error saving settings:", err);
    res.status(500).json({ success: false, error: "Failed to save settings" });
  }
}

// GET /api/settings/public  (no auth — safe public fields only)
export async function handleGetPublicSettings(req, res) {
  try {
    const settings = await getSettings();
    res.json({
      pdfLabel: settings.pdf?.menuLabel ?? "Download Menu",
    });
  } catch {
    res.json({ pdfLabel: "Download Menu" });
  }
}

// GET /api/settings/inbox  (requireAuth)
export async function handleGetInbox(req, res) {
  try {
    const submissions = await getSubmissions();
    res.json({ success: true, submissions });
  } catch (err) {
    console.error("Error fetching inbox:", err);
    res.status(500).json({ success: false, error: "Failed to load inbox" });
  }
}

// PATCH /api/settings/inbox/:id/read  (requireAuth)
export async function handleMarkRead(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, error: "Invalid id" });
    }
    await markSubmissionRead(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking submission read:", err);
    res.status(500).json({ success: false, error: "Failed to update" });
  }
}
