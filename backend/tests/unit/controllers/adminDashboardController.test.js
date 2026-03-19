import {describe, it, expect, vi, beforeEach} from "vitest";
import {getStats} from "../../../src/controllers/adminDashboardController.js";
import { pool } from "../../../src/db/connect_db.js";
import { logActivity } from "../../../src/controllers/activityController.js";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock("../../../src/controllers/activityController.js", () => ({
  logActivity: vi.fn(),
}));

function mockReqRes({
  body = {},
  params = {},
  user = { email: "admin@test.com" },
} = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };
  const req = { body, params, user };
  return { req, res };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getStats", () => {
    it("returns menu item count and image count with status 200", async () => {
        pool.query.mockResolvedValueOnce([[{count: 100}]]);

        pool.query.mockResolvedValueOnce(
            [[
                {TABLE_NAME: "about", COLUMN_NAME: "hero_image_url"},
                {TABLE_NAME: "menu_items", COLUMN_NAME: "image_url"}
            ]]
        );

        pool.query.mockResolvedValueOnce([[{count:50}]]);

        pool.query.mockResolvedValueOnce([[{count:50}]]);

        const {req, res} = mockReqRes();
        await getStats(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            {
                dashboard: {
                    numMenuItems: 100,
                    numImages: 100
                }
            }

        );
    })

    it("should handle no image columns", async () => {
        pool.query.mockResolvedValueOnce([[{ count: 4 }]])
        pool.query.mockResolvedValueOnce([[]]) //No columns found
        
        const {req,res} = mockReqRes();
        await getStats(req, res);

        expect(res.json).toHaveBeenCalledWith({
            dashboard: {
                numMenuItems: 4,
                numImages: 0
            }
        });
    });

    it("should ignore invalid table/column entries", async () => {
        pool.query.mockResolvedValueOnce([[{ count: 1 }]]);

        pool.query.mockResolvedValueOnce([[
                { TABLE_NAME: "valid", COLUMN_NAME: "image_url" },
                { TABLE_NAME: null, COLUMN_NAME: "image_url" },
                { TABLE_NAME: "bad", COLUMN_NAME: null }
        ]]);

        pool.query.mockResolvedValueOnce([[{ count: 2 }]]);

        const {req,res} = mockReqRes();
        await getStats(req, res);

        expect(res.json).toHaveBeenCalledWith({
            dashboard: {
                numMenuItems: 1,
                numImages: 2
            }
        });
    });

    it("returns 500 on db error", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB fail"));

        const {req,res} = mockReqRes();
        await getStats(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to load dashboard stats" });
    });
});