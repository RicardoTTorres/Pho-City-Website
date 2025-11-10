import { pool } from "../db/connect_db.js";

export async function getAbout(req, res) {
    const [[about]] = await pool.query(`
        SELECT * FROM ABOUT_SECTION;
        `);
    res.json({
        about: {
            title: about.about_title,
            content: about.about_description
        }
    });
}

export async function updateAbout(req, res) {
  try {
    const { title, content, about_page_url } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    await pool.query(
      `UPDATE about_section
       SET about_title = ?, about_description = ?, about_page_url = ?
       WHERE about_id = 1`,
      [title, content, about_page_url || null]
    );

    res.json({ message: "About section updated successfully!" });
  } catch (error) {
    console.error("Error updating About section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}