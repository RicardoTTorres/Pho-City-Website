import { pool } from "../db/connect_db.js"; 
export async function getAbout(req, res) {
    const [[about]] = await pool.query(`
        SELECT * FROM about_section;
        `);
    res.json({
        about: {
            title: about.about_title,
            content: about.about_description
        }
    });
}