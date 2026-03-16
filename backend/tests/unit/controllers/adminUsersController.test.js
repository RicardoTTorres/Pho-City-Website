import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminUsers, getAdminUserById, createAdminUser, updateAdminUser, deleteAdminUser } from "../../../src/controllers/adminUsersController.js";
import { pool } from "../../../src/db/connect_db.js";
import bcrypt from "bcrypt";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn()
  }
}));

vi.mock("bcrypt", () => ({
    default: {
        hash: vi.fn()
    }
}));

function mockReqRes({
    body = {},
    params = {},
    user = { id: 11, email: "ops@phocity.com" }
} = {}) {
    const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
        send: vi.fn()
    };

    const req = { body, params, user };
    return { req, res };
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getAdminUsers", () => {
    it("return admin users in order from the database", async () => {
        const adminRows = [
            {
                id: 2,
                email: "frodo.baggins@phocity.com",
                role: "editor",
                created_at: "2026-02-19 10:11:12"
            },
            {
                id: 2,
                email: "bruce.wayne@phocity.com",
                role: "admin",
                created_at: "2026-02-20 08:05:01" 
            }
        ];

        pool.query.mockResolvedValueOnce([adminRows]);

        const { req, res } = mockReqRes();
        await getAdminUsers(req, res);

        expect(res.json).toHaveBeenCalledWith({ adminUsers: adminRows });
    });

    it("return 500 when database fails to load admin users", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB failure"));

        const { req, res } = mockReqRes();
        await getAdminUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to load admin users" });
    });

});