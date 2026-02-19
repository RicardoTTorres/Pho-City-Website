// src/controllers/heroController.js
import { pool } from "../db/connect_db.js";
import { logActivity } from "./activityController.js";

export const getHero = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        hero_id,
        hero_main_title,
        hero_subtitle,
        hero_button_text,
        hero_secondary_button_text,
        hero_image_url
       FROM hero_section
       ORDER BY hero_id ASC
       LIMIT 1`,
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Hero not found" });
    }

    const h = rows[0];
    return res.status(200).json({
      id: h.hero_id,
      title: h.hero_main_title,
      subtitle: h.hero_subtitle,
      ctaText: h.hero_button_text,
      secondaryCtaText: h.hero_secondary_button_text ?? null,
      imageUrl: h.hero_image_url ?? null,
    });
  } catch (err) {
    console.error("GET /api/hero error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateHero = async (req, res) => {
  try {
    const { title, subtitle, ctaText, secondaryCtaText, imageUrl } = req.body;

    if (
      typeof title !== "string" ||
      typeof subtitle !== "string" ||
      typeof ctaText !== "string" ||
      typeof secondaryCtaText !== "string"
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    await pool.query(
      `UPDATE hero_section
       SET hero_main_title = ?,
           hero_subtitle = ?,
           hero_button_text = ?,
           hero_secondary_button_text =?,
           hero_image_url = ?
       WHERE hero_id = 1`,
      [title, subtitle, ctaText, secondaryCtaText, imageUrl ?? null],
    );

    const [rows] = await pool.query(
      `SELECT 
        hero_id,
        hero_main_title,
        hero_subtitle,
        hero_button_text,
        hero_secondary_button_text,
        hero_image_url
       FROM hero_section
       WHERE hero_id = 1
       LIMIT 1`,
    );

    const h = rows[0];
    logActivity("updated", "hero", "Updated hero section", req.user?.email);
    return res.status(200).json({
      id: h.hero_id,
      title: h.hero_main_title,
      subtitle: h.hero_subtitle,
      ctaText: h.hero_button_text,
      secondaryCtaText: h.hero_secondary_button_text,
      imageUrl: h.hero_image_url ?? null,
    });
  } catch (err) {
    console.error("PUT /api/hero error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
