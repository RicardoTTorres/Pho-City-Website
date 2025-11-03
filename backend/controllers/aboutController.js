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