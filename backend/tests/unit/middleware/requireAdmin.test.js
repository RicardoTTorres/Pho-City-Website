import { describe, expect, it, vi } from "vitest";
import { requireAdmin } from "../../../src/middleware/requireAdmin.js";

function mockReqRes({ req } = {}) {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    }
    const next = vi.fn();
    return { req, res, next };
}

describe("requireAdmin", () => {
    it("returns 403 when user role isn't admin", () => {
        const roles = ["1admin", "", { admin: "" }, { admin: "admin" }, { admin: {} }, {}, " ", "admin "]

        for (let i = 0; i < roles.length; i++)
        {
            const { req, res, next } = mockReqRes({ req: { user: { role: roles[i] } } });

            requireAdmin(req, res, next);
    
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
            expect(next).not.toHaveBeenCalled();
        }
    });

    it("returns 403 when user has no role", () => {
        const { req, res, next } = mockReqRes({ req: { user: {} } });

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when there isn't a user", () => {
        const { req, res, next } = mockReqRes({ req: {} });

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated" });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next when user is an admin", () => {
        const { req, res, next } = mockReqRes({ req: { user: { role: "admin" } } });

        requireAdmin(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
});