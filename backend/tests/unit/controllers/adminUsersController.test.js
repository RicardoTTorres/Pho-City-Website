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
    it("returns admin users in order from the database", async () => {
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

    it("returns 500 when database fails to load admin users", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB failure"));

        const { req, res } = mockReqRes();
        await getAdminUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to load admin users" });
    });
});

describe("getAdminUserById", () => {
    it("returns 400 when user id is invalid", async () => {
        const { req, res } = mockReqRes({
            params: { id: "zero" }
        });

        await getAdminUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid user id" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 404 when admin user not found", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const { req, res } = mockReqRes({
            params: { id: "12" }
        });

        await getAdminUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Admin user not found" });
    });
    
    it("returns admin user when id exists in the database", async () => {
        const adminUser = {
            id: 5,
            email: "bruce.wayne@phocity.com",
            role: "admin",
            created_at: "2026-02-14 14:40:00",
        };
    
        pool.query.mockResolvedValueOnce([[adminUser]]);

        const { req, res } = mockReqRes({
            params: { id: "5" }
        });

        await getAdminUserById(req, res);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE id = ?"),
            [5]
        );
        expect(res.json).toHaveBeenCalledWith({ adminUser });
    });

    it("returns 500 when the database fails fetch an admin user", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB failure"));

        const { req, res } = mockReqRes({
            params: { id: "9" }
        });

        await getAdminUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to load admin user" });
    });
});

describe("createAdminUser", () => {
    it("returns 400 when email or password is missing", async () => {
        const { req, res } = mockReqRes({
            body: { email: "bob.smith@phocity.com" }
        });

        await createAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "email and password are required" });
        expect(pool.query).not.toHaveBeenCalled();
    })

    it("returns 400 when email or password has an invalid type", async () => {
        const { req, res } = mockReqRes({
            body: { 
                email: ["not", "a", "string"],
                password: "helloWorld"
            }
        });

        await createAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid payload" });
        expect(pool.query).not.toHaveBeenCalled();
    })

});