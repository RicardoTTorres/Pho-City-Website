import { pool } from "../db/connect_db.js";

export async function getFooter(req, res) {
    try {
        const [rows] = await pool.query(
        "SELECT footer_json FROM site_settings WHERE id = 1 LIMIT 1"
        );

        // table empty
        if (rows.length === 0) {
        return res.status(404).json({ error: "Footer settings not found" });
        }

        // return JSON as an object
        const footer =
        typeof rows[0].footer_json === "string"
            ? JSON.parse(rows[0].footer_json)
            : rows[0].footer_json;

        return res.json({ footer });
    } catch (err) {
        console.error("getFooter error:", err);
        return res.status(500).json({ error: "Failed to fetch footer" });
    }
}
