import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

const {
  JWT_SECRET,
  blacklistToken,
  requireAuth,
} = await import("../../../src/middleware/requireAuth.js");
const { pool } = await import("../../../src/db/connect_db.js");

function mockReqRes({ cookies } = {}) {
  const req = { cookies };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const next = vi.fn();
  return { req, res, next };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("blacklist helpers", () => {
  it("adds a token jti to the DB blacklist", async () => {
    await blacklistToken("jti-123", 1_900_000_000);

    expect(pool.query).toHaveBeenCalledWith(
      "INSERT IGNORE INTO token_blacklist (jti, expires_at) VALUES (?, ?)",
      ["jti-123", new Date(1_900_000_000 * 1000)],
    );
  });

  it("does not add empty token ids", async () => {
    await blacklistToken(undefined, 1_900_000_000);
    await blacklistToken("", 1_900_000_000);

    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("module initialization", () => {
  it("throws when JWT_SECRET is missing at import time", async () => {
    vi.resetModules();
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    try {
      await expect(
        import("../../../src/middleware/requireAuth.js?missing-secret"),
      ).rejects.toThrow("Missing required environment variable: JWT_SECRET");
    } finally {
      process.env.JWT_SECRET = originalSecret;
    }
  });
});

describe("requireAuth", () => {
  it("returns 401 when no auth cookie is present", async () => {
    const { req, res, next } = mockReqRes();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token jti is blacklisted", async () => {
    const token = jwt.sign(
      { id: 1, email: "admin@test.com", jti: "jti-blacklisted" },
      JWT_SECRET,
    );
    pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);
    const { req, res, next } = mockReqRes({ cookies: { auth: token } });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token has been invalidated",
    });
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT 1 FROM token_blacklist WHERE jti = ? LIMIT 1",
      ["jti-blacklisted"],
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches decoded user and calls next for valid token", async () => {
    const token = jwt.sign(
      { id: 7, email: "admin@test.com", role: "admin", jti: "jti-ok" },
      JWT_SECRET,
    );
    pool.query.mockResolvedValueOnce([[]]);
    const { req, res, next } = mockReqRes({ cookies: { auth: token } });

    await requireAuth(req, res, next);

    expect(req.user).toMatchObject({
      id: 7,
      email: "admin@test.com",
      role: "admin",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    const { req, res, next } = mockReqRes({ cookies: { auth: "bad.token" } });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
