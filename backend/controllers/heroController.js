import { pool } from "../db/connect_db.js";

// Centralized defaults so the frontend always receives a predictable shape.
const DEFAULT_HERO = {
  id: 1,
  title: "",
  subtitle: "",
  ctaText: "",
  secondaryCtaText: null,
  imageUrl: null,
};

export const getHero = async (req, res) => {
  try {
    // NOTE: hero_section does NOT include hero_secondary_button_text in init.sql.
    // We only select columns that exist to avoid SQL errors.
    const [rows] = await pool.query(
      `SELECT 
        hero_id,
        hero_main_title,
        hero_subtitle,
        hero_button_text,
        hero_image_url
       FROM hero_section
       ORDER BY hero_id ASC
       LIMIT 1`,
    );

    // If the table is empty, return defaults instead of crashing the frontend.
    if (!rows.length) {
      return res.status(200).json(DEFAULT_HERO);
    }

    const h = rows[0];
    return res.status(200).json({
      id: h.hero_id,
      title: h.hero_main_title ?? "",
      subtitle: h.hero_subtitle ?? "",
      ctaText: h.hero_button_text ?? "",
      // Column does not exist; keep the API stable by returning null.
      secondaryCtaText: null,
      imageUrl: h.hero_image_url ?? null,
    });
  } catch (err) {
    console.error("GET /api/hero error:", err);
    return res.status(500).json({
      error: "Failed to fetch hero",
      details: err instanceof Error ? err.message : String(err),
    });
  }
};

export const updateHero = async (req, res) => {
  try {
    const { title, subtitle, ctaText, imageUrl } = req.body;

    // Validate required strings; imageUrl can be null/undefined.
    if (
      typeof title !== "string" ||
      typeof subtitle !== "string" ||
      typeof ctaText !== "string"
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // hero_secondary_button_text is not in the schema, so we do not update it.
    await pool.query(
      `UPDATE hero_section
       SET hero_main_title = ?,
           hero_subtitle = ?,
           hero_button_text = ?,
           hero_image_url = ?
       WHERE hero_id = 1`,
      [title, subtitle, ctaText, imageUrl ?? null],
    );

    const [rows] = await pool.query(
      `SELECT 
        hero_id,
        hero_main_title,
        hero_subtitle,
        hero_button_text,
        hero_image_url
       FROM hero_section
       WHERE hero_id = 1
       LIMIT 1`,
    );

    if (!rows.length) {
      return res.status(200).json(DEFAULT_HERO);
    }

    const h = rows[0];
    return res.status(200).json({
      id: h.hero_id,
      title: h.hero_main_title ?? "",
      subtitle: h.hero_subtitle ?? "",
      ctaText: h.hero_button_text ?? "",
      secondaryCtaText: null,
      imageUrl: h.hero_image_url ?? null,
    });
  } catch (err) {
    console.error("PUT /api/hero error:", err);
    return res.status(500).json({
      error: "Failed to update hero",
      details: err instanceof Error ? err.message : String(err),
    });
  }
};
