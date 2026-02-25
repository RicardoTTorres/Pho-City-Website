import { describe, it, expect, beforeEach, vi } from "vitest";

import jwt from "jsonwebtoken";

import {
  requireAuth,
  tokenBlacklist,
  blacklistToken,
  JWT_SECRET,
} from "../../../src/middleware/requireAuth.js";

function makeReqResNext({ cookie = null } = {}) {
  const req = { cookies: cookie ? { auth: cookie } : {} };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  const next = vi.fn();

  return { req, res, next };
}

function makeToken(payload = {}, options = {}) {
  return jwt.sign({ id: 1, role: "admin", ...payload }, JWT_SECRET, {
    expiresIn: "1h",
    ...options,
  });
}

describe("requireAuth middleware", () => {
  beforeEach(() => {
    tokenBlacklist.clear();
  });

  it("returns 401 when no cookie is present", () => {
    const { req, res, next } = makeReqResNext();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is on blacklist", () => {
    const token = makeToken();
    blacklistToken(token);
    const { req, res, next } = makeReqResNext({ cooke: token });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token invalidated" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and populates req.user when token is valid", () => {
    const token = makeToken({ id: 42, role: "admin" });
    const { req, res, next } = makeReqResNext({ cookie: token });

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({ id: 42, role: "admin" });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when token expired", () => {
    const token = makeToken({}, { expiresIn: 0 });
    const { req, res, next } = makeReqResNext({ cookie: token });
    requiredAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
