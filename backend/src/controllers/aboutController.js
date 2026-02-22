import { pool } from "../db/connect_db.js";

export async function getAbout(req, res) {
  const [[about]] = await pool.query(`
        SELECT * FROM about_section;
        `);
  res.json({
    about: {
      title: about.about_title,
      content: about.about_description,
    },
  });
}

export async function updateAbout(req, res) {
  try {
    const { title, content} = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    await pool.query(
      `UPDATE about_section
       SET about_title = ?, about_description = ?
       WHERE about_id = 1`,
      [title, content || null],
    );

    res.status(200).json({ message: "About section updated successfully!" });
  } catch (error) {
    console.error("Error updating About section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
