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

/*
 * PUT /api/footer
 *
 * Expects request body in the following format:
 *
 * {
 *   "footer": {
 *     "navLinks": [
 *       { "label": "Home", "path": "/" },
 *       { "label": "Menu", "path": "/menu" },
 *       { "label": "Order", "path": "https://...", "external": true }
 *     ],
 *     "contact": {
 *       "address": "6175 Stockton Blvd #200",
 *       "cityZip": "Sacramento, CA 95824",
 *       "phone": "(916) 754-2143"
 *     },
 *     "socialLinks": [
 *       { "platform": "instagram", "url": "https://instagram.com/", "icon": "instagram" }
 *     ]
 *   }
 * }
 *
 * This endpoint overwrites the footer configuration stored in site_settings.footer_json (single-row table, id = 1).
 * Intended to be used by the CMS.
 */
export async function putFooter(req, res) {
    try {
        const { footer } = req.body;

        if (!footer) {
        return res.status(400).json({ error: "Missing footer in request body" });
        }

        await pool.query(
        "INSERT INTO site_settings (id, footer_json) VALUES (1, ?) " +
        "ON DUPLICATE KEY UPDATE footer_json = VALUES(footer_json)",
      [JSON.stringify(footer)],
    );

        res.json({ ok: true, footer });
    } catch (err) {
        console.error("putFooter error:", err);
        res.status(500).json({ error: "Failed to update footer" });
    }
}
