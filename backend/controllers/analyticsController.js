import { pool } from "../db/connect_db.js";

export async function getTraffic(req, res) {
    // temporary data
    res.json({
        total: {
          totalViews: 1234,
          uniqueVisitors: 567,
        },
        daily: [
          { day: "2025-11-10", views: 75 },
          { day: "2025-11-11", views: 120 },
          { day: "2025-11-12", views: 95 },
          { day: "2025-11-13", views: 180 },
          { day: "2025-11-14", views: 160 },
          { day: "2025-11-15", views: 130 },
        ],
        topPages: [
          { path: "/menu", views: 500 },
          { path: "/", views: 420 },
          { path: "/about", views: 180 },
          { path: "/contact", views: 110 },
          { path: "/stats", views: 38 },
        ],
      });
}

export async function postTraffic(req, res) {
    // TODO: implement logging
    res.json({ok: true});
}