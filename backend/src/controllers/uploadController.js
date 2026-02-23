// src/controllers/uploadController.js
import { uploadToS3, listFromS3, deleteFromS3 } from "../services/s3Service.js";

const ALLOWED_SECTIONS = ["menu", "hero", "about", "brand"];
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function handleUpload(req, res) {
  try {
    const section = req.query.section;
    if (!section || !ALLOWED_SECTIONS.includes(section)) {
      return res
        .status(400)
        .json({ error: `section must be one of: ${ALLOWED_SECTIONS.join(", ")}` });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ error: `File type not allowed. Accepted: jpeg, png, webp` });
    }

    if (file.size > MAX_SIZE) {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 5 MB" });
    }

    const sanitized = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .toLowerCase();
    const key = `${section}/${Date.now()}-${sanitized}`;

    const url = await uploadToS3(file.buffer, key, file.mimetype);

    res.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}

export async function handleList(req, res) {
  try {
    const section = req.query.section;
    const prefix =
      section && ALLOWED_SECTIONS.includes(section) ? `${section}/` : "";
    const items = await listFromS3(prefix);
    res.json({ items });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to list media" });
  }
}

export async function handleDelete(req, res) {
  try {
    const { key } = req.body;
    if (!key || typeof key !== "string") {
      return res.status(400).json({ error: "key is required" });
    }

    const section = key.split("/")[0];
    if (!ALLOWED_SECTIONS.includes(section)) {
      return res.status(400).json({ error: "Invalid key" });
    }

    await deleteFromS3(key);
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete media" });
  }
}
