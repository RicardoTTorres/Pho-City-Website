import { pool } from "../db/connect_db.js";

export async function getTraffic(req, res) {
    try {
        const [pages] = await pool.query(`
            SELECT
                page AS path,
                page_views AS views
            FROM traffic_pages
            ORDER BY views DESC; 
        `);

        const total = pages.reduce(
            (sum, item) => sum + item.views,
            0
        )

        const [days] = await pool.query(`
            SELECT
                date AS day,
                date_views AS views
            FROM traffic_dates;
        `);

        const [unique] = await pool.query(`
            SELECT COUNT(*) FROM traffic_visitors
        `);

        res.json({
            total: {
                totalViews: total,
                uniqueVisitors: unique
            },
            daily: days,
            topPages: pages
        });

    } catch (err) {
        console.error("Get Traffic Error:", err);
        res.status(500).json({ error: "error getting traffic analytics" });
    }

    // // temporary data
    // res.json({
    //     total: {
    //       totalViews: 1234,
    //       uniqueVisitors: 567,
    //     },
    //     daily: [
    //       { day: "2025-11-10", views: 75 },
    //       { day: "2025-11-11", views: 120 },
    //       { day: "2025-11-12", views: 95 },
    //       { day: "2025-11-13", views: 180 },
    //       { day: "2025-11-14", views: 160 },
    //       { day: "2025-11-15", views: 130 },
    //     ],
    //     topPages: [
    //       { path: "/menu", views: 500 },
    //       { path: "/", views: 420 },
    //       { path: "/about", views: 180 },
    //       { path: "/contact", views: 110 },
    //       { path: "/stats", views: 38 },
    //     ],
    //   });
}

export async function postTraffic(req, res) {
    try {
        const {uuid, path} = req.body;
        if (uuid === undefined || path === undefined) {
            res.status(400).json({ error: "Missing required properties" });
        }

        const [result] = await pool.query(`
            INSERT INTO traffic_pages
            VALUES (?, 1)
            ON DUPLICATE KEY UPDATE
                page_views = page_views + 1;`,
            [path]
        );

        const [result2] = await pool.query(`
            INSERT INTO traffic_dates
            VALUES (?, 1)
            ON DUPLICATE KEY UPDATE
                date_views = date_views + 1;`,
            [new Date().toISOString()]
        );

        const [result3] = await pool.query(`
            INSERT IGNORE INTO traffic_visitors
            VALUES (?);`,
            [uuid]
        );

        res.json({ok: true});

    } catch (err) {
        console.error("Post Traffic Error:", err);
        res.json({ok: false, error: "Error logging traffic"});
    }
}