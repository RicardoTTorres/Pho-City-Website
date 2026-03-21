import { describe, it, expect, vi } from "vitest";
import { logActivity, getRecentActivity } from "../../../src/controllers/activityController.js";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from "../../../src/db/connect_db.js";

function mockReqRes({
  body = {},
  params = {},
  user = {},
  ip = "127.0.0.1"
} = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };

  const req = { body, params, user, ip };

  return { req, res };
}

describe("activityController", () => {

  it("inserts activity into database", async () => {
    pool.query.mockResolvedValue([]);

    await logActivity("CREATE", "users", "created user", "admin@test.com");

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO activity_log"),
      ["CREATE", "users", "created user", "admin@test.com"]
    );
  });

  it("sets adminEmail to null if undefined", async () => {
    pool.query.mockResolvedValue([]);

    await logActivity("DELETE", "users", "deleted user");

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      ["DELETE", "users", "deleted user", null]
    );
  });

  it("returns recent activity", async () => {
    const fakeRows = [
      { id: 1, action: "CREATE", section: "users" }
    ];

    pool.query.mockResolvedValue([fakeRows]);

    const { req, res } = mockReqRes();

    await getRecentActivity(req, res);

    expect(res.json).toHaveBeenCalledWith({
      activity: fakeRows
    });
  });

  it("returns 500 when database fails", async () => {
    pool.query.mockRejectedValue(new Error("DB fail"));

    const { req, res } = mockReqRes();

    await getRecentActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch activity"
    });
  });

});