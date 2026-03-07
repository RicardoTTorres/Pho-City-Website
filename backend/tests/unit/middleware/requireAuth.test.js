import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret";

const {
  JWT_SECRET,
  blacklistToken,
  isTokenBlacklisted,
  requireAuth,
  tokenBlacklist,
} = await import("../../../src/middleware/requireAuth.js");

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
  tokenBlacklist.clear();
});

describe("blacklist helpers", () => {
  it("adds a token to the blacklist", () => {
    blacklistToken("token-123");

    expect(isTokenBlacklisted("token-123")).toBe(true);
  });

  it("does not add empty tokens", () => {
    blacklistToken(undefined);
    blacklistToken("");

    expect(tokenBlacklist.size).toBe(0);
  });
});

describe("requireAuth", () => {
  it("returns 401 when no auth cookie is present", () => {
    const { req, res, next } = mockReqRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is blacklisted", () => {
    const token = jwt.sign({ id: 1, email: "admin@test.com" }, JWT_SECRET);
    blacklistToken(token);
    const { req, res, next } = mockReqRes({ cookies: { auth: token } });

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token has been invalidated",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches decoded user and calls next for valid token", () => {
    const token = jwt.sign(
      { id: 7, email: "admin@test.com", role: "admin" },
      JWT_SECRET,
    );
    const { req, res, next } = mockReqRes({ cookies: { auth: token } });

    requireAuth(req, res, next);

    expect(req.user).toMatchObject({
      id: 7,
      email: "admin@test.com",
      role: "admin",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    const { req, res, next } = mockReqRes({ cookies: { auth: "bad.token" } });

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
