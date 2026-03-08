//src/controllers/aboutController.js
import { pool } from "../db/connect_db.js";
import { logActivity } from "./activityController.js";

export async function getAbout(req, res) {
  try {
    const [[row]] = await pool.query(
      `SELECT * FROM about_page_content LIMIT 1`
    );

    if (!row) {
      return res.status(200).json({
        about: {
          heroTitle: "",
          heroIntro: "",
          heroImage: null,
          beginningTitle: "",
          beginningBody: "",
          beginningImage: null,
          foodTitle: "",
          foodBody: "",
          foodImage: null,
          commitmentTitle: "",
          commitmentBody: "",
          commitmentImage: null,
          closingText: "",
          previewHeading: "",
          previewBody: "",
          previewButtonLabel: "",
        },
      });
    }

    res.status(200).json({
      about: {
        heroTitle:           row.hero_title            ?? "",
        heroIntro:           row.hero_intro            ?? "",
        heroImage:           row.hero_image_url        || null,
        beginningTitle:      row.beginning_title       ?? "",
        beginningBody:       row.beginning_body        ?? "",
        beginningImage:      row.beginning_image_url   || null,
        foodTitle:           row.food_title            ?? "",
        foodBody:            row.food_body             ?? "",
        foodImage:           row.food_image_url        || null,
        commitmentTitle:     row.commitment_title      ?? "",
        commitmentBody:      row.commitment_body       ?? "",
        commitmentImage:     row.commitment_image_url  || null,
        closingText:         row.closing_text          ?? "",
        previewHeading:      row.preview_heading       ?? "",
        previewBody:         row.preview_body          ?? "",
        previewButtonLabel:  row.preview_button_label  ?? "",
      },
    });
  } catch (error) {
    console.error("Error fetching About section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateAbout(req, res) {
  try {
    const {
      heroTitle,
      heroIntro,
      heroImage,
      beginningTitle,
      beginningBody,
      beginningImage,
      foodTitle,
      foodBody,
      foodImage,
      commitmentTitle,
      commitmentBody,
      commitmentImage,
      closingText,
      previewHeading,
      previewBody,
      previewButtonLabel,
    } = req.body;

    if (!heroTitle) {
      return res.status(400).json({ message: "Hero title is required." });
    }

    await pool.query(
      `INSERT INTO about_page_content
         (id, hero_title, hero_intro, hero_image_url,
          beginning_title, beginning_body, beginning_image_url,
          food_title, food_body, food_image_url,
          commitment_title, commitment_body, commitment_image_url,
          closing_text,
          preview_heading, preview_body, preview_button_label)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         hero_title             = VALUES(hero_title),
         hero_intro             = VALUES(hero_intro),
         hero_image_url         = VALUES(hero_image_url),
         beginning_title        = VALUES(beginning_title),
         beginning_body         = VALUES(beginning_body),
         beginning_image_url    = VALUES(beginning_image_url),
         food_title             = VALUES(food_title),
         food_body              = VALUES(food_body),
         food_image_url         = VALUES(food_image_url),
         commitment_title       = VALUES(commitment_title),
         commitment_body        = VALUES(commitment_body),
         commitment_image_url   = VALUES(commitment_image_url),
         closing_text           = VALUES(closing_text),
         preview_heading        = VALUES(preview_heading),
         preview_body           = VALUES(preview_body),
         preview_button_label   = VALUES(preview_button_label)`,
      [
        heroTitle,
        heroIntro          ?? null,
        heroImage          ?? null,
        beginningTitle     ?? null,
        beginningBody      ?? null,
        beginningImage     ?? null,
        foodTitle          ?? null,
        foodBody           ?? null,
        foodImage          ?? null,
        commitmentTitle    ?? null,
        commitmentBody     ?? null,
        commitmentImage    ?? null,
        closingText        ?? null,
        previewHeading     ?? null,
        previewBody        ?? null,
        previewButtonLabel ?? null,
      ]
    );

    logActivity("updated", "about", "Updated about section", req.user?.email);
    res.status(200).json({ message: "About section updated successfully!" });
  } catch (error) {
    console.error("Error updating About section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
