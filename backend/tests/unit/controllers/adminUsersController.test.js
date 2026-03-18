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
    });

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
    });

    it("returns 400 when role type is not permitted admin role", async () => {
        const { req, res } = mockReqRes({
            body: { 
                email: "bob.smith@phocity.com",
                password: "helloWorld",
                role: "supervisor"
            }
        });

        await createAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid role" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("creates admin user, normalize fields, and returns the inserted admin record", async () => {
        const createdAdmin = {
            id: 13,
            email: "bob.smith@phocity.com",
            role: "editor",
            created_at: "2026-03-01 21:45:00"
        };

        bcrypt.hash.mockResolvedValueOnce("asdfghjkl1@");
        pool.query.mockResolvedValueOnce([{ insertId: 13 }]).mockResolvedValueOnce([[createdAdmin]]);

        const { req, res } = mockReqRes({
            body: {
                email: "Bob.Smith@PhoCity.com",
                password: "helloWorld1$",
                role: "EDITOR"
            }
        });

        await createAdminUser(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith("helloWorld1$", 10);
        expect(pool.query).toHaveBeenNthCalledWith(
              1,
              expect.stringContaining("INSERT INTO admins"),
              ["bob.smith@phocity.com", "asdfghjkl1@", "editor"]
        );
        expect(pool.query).toHaveBeenNthCalledWith(
              2,
              expect.stringContaining("SELECT id, email, role, created_at"),
              [13]
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ adminUser: createdAdmin });
    });

    it("returns 409 when trying to create a duplicate admin email", async () => {
        bcrypt.hash.mockResolvedValueOnce("hashed-dup");
        pool.query.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });

        const { req, res } = mockReqRes({
            body: { 
                email: "bob.smith@phocity.com",
                password: "helloWorld1@",
                role: "admin"
            }
        });

        await createAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
    });

    it("returns 500 when creating admin user fails", async () => {
        bcrypt.hash.mockResolvedValueOnce("hashed-unexpected");
            pool.query.mockRejectedValueOnce(new Error("insert failed"));

        const { req, res } = mockReqRes({
            body: { 
                email: "bob.smith@phocity.com",
                password: "helloWorld1@",
                role: "admin"
            }
        });

        await createAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to create admin user" });
    });
});

describe("updateAdminUser", () => {
    it("returns 400 when user id is invalid", async () => {
        const { req, res } = mockReqRes({
            params: { id: "-3" },
            body: { role: "editor" }
        });

        await updateAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid user id" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 400 when email update is blank", async () => {
        const { req, res } = mockReqRes({
            params: { id: "4" },
            body: { email: " " }
        });

        await updateAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid email" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 400 when password update is invalid", async () => {
        const { req, res } = mockReqRes({
            params: { id: "4" },
            body: { password: "" }
        });

        await updateAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid password" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 400 when role update is invalid", async () => {
        const { req, res } = mockReqRes({
            params: { id: "4" },
            body: { role: "manager" }
        });

        await updateAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid role" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 400 when no valid fields were provided to update", async () => {
        const { req, res } = mockReqRes({
            params: { id: "4" },
            body: {}
        });

        await updateAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "No fields to update" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("updates email and role, then returns the updated admin user", async () => {
        const updatedAdmin = {
            id: 4,
            email: "bob.smith@phocity.com",
            role: "editor",
            created_at: "2026-01-09 07:30:00"
        };

        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]).mockResolvedValueOnce([[updatedAdmin]]);

        const { req, res } = mockReqRes({
            params: { id: "4" },
            body: {
                email: "Bob.Smith@PhoCity.com",
                role: "EDITOR"
            }
        });
        
        await updateAdminUser(req, res);

        expect(pool.query).toHaveBeenNthCalledWith(
              1,
              expect.stringContaining("SET email = ?, role = ?"),
              ["bob.smith@phocity.com", "editor", 4]
        );
        expect(pool.query).toHaveBeenNthCalledWith(
              2,
              expect.stringContaining("SELECT id, email, role, created_at"),
              [4]
        );
        expect(res.json).toHaveBeenCalledWith({ adminUser: updatedAdmin });
    });

    it("hashes password before saving password update", async () => {
        const updatedAdmin = {
            id: 4,
            email: "bob.smith@phocity.com",
            role: "admin",
            created_at: "2026-01-09 07:30:00"
        };

        bcrypt.hash.mockResolvedValueOnce("hash-reset");
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]).mockResolvedValueOnce([[updatedAdmin]]);

        const { req, res } = mockReqRes({
            params: { id: "8" },
            body: {
                password: "helloWorld1@"
            }
        });
        
        await updateAdminUser(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith("helloWorld1@", 10);
        expect(pool.query).toHaveBeenNthCalledWith(
              1,
              expect.stringContaining("SET password_hash = ?"),
              ["hash-reset", 8]
        );
        expect(res.json).toHaveBeenCalledWith({ adminUser: updatedAdmin });
    });

    it("returns 404 when update affects 0 rows", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    
        const { req, res } = mockReqRes({
            params: { id: "22" },
            body: {
                role: "editor"
            }
        });
    
        await updateAdminUser(req, res);
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Admin user not found" });
    });

    it("returns 409 when updated email already exists for another admin", async () => {
        pool.query.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });
    
        const { req, res } = mockReqRes({
            params: { id: "22" },
            body: {
                email: "bob.smith@phocity.com"
            }
        });
    
        await updateAdminUser(req, res);
    
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
    });

    it("returns 500 when admin update fails unexpectedly", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB failure"));
    
        const { req, res } = mockReqRes({
            params: { id: "22" },
            body: {
                role: "admin"
            }
        });
    
        await updateAdminUser(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to update admin user" });
    });
});

describe("deleteAdminUser", () => {
    it("returns 400 when user id is invalid", async () => {
        const{ req, res } = mockReqRes({
            params: { id: "abc" }
        });

        await deleteAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid user id" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 400 when admin tries to delete the current logged in user", async () => {
        const{ req, res } = mockReqRes({
            params: { id: "11" },
            user: { id: 11, email: "bob.smith@phocity.com"}
        });

        await deleteAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Cannot delete current user" });
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 404 when deleted admin user does not exist", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const{ req, res } = mockReqRes({
            params: { id: "17" },
            user: { id: 3, email: "bob.smith@phocity.com"}
        });

        await deleteAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Admin user not found" });
    });

    it("deletes admin user and returns 204 with no content", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const{ req, res } = mockReqRes({
            params: { id: "14" },
            user: { id: 3, email: "bob.smith@phocity.com"}
        });

        await deleteAdminUser(req, res);

        expect(pool.query).toHaveBeenCalledWith(
              expect.stringContaining("DELETE FROM admins"),
              [14]
        );
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it("returns 500 when delete admin user query fails", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB failure"));

        const{ req, res } = mockReqRes({
            params: { id: "14" },
            user: { id: 3, email: "bob.smith@phocity.com"}
        });

        await deleteAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete admin user" });
    });
});