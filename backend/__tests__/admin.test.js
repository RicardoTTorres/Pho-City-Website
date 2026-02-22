import request from "supertest";
import app from "../src/server.js";
import bcrypt from "bcrypt";
import { pool } from "../src/db/connect_db.js";

describe("Admin auth flow", () => {

  test("rejects access to /me without login", async () => {
    const res = await request(app).get("/api/admin/me");
    expect(res.statusCode).toBe(401);
  });

  test("allows login and access to protected route", async () => {
    const agent = request.agent(app);

    // login
    const loginRes = await agent
      .post("/api/admin/login")
      .send({
        email: process.env.ADMIN_DEFAULT_EMAIL || "admin@phocity.com",
        password: process.env.ADMIN_DEFAULT_PASSWORD || "changeme"
      });

    expect(loginRes.statusCode).toBe(200);

    // access protected route
    const meRes = await agent.get("/api/admin/me");

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.ok).toBe(true);
  });

});

test("admin password is stored hashed in database", async () => {
  const [rows] = await pool.query(
    "SELECT password_hash FROM admins WHERE email = ?",
    ["admin@phocity.com"]
  );

  expect(rows.length).toBeGreaterThan(0);
  const storedHash = rows[0].password_hash;

  // making sure it's not plain text
  expect(storedHash).not.toBe("changeme");

  // making sure it validates with bcrypt
  const matches = await bcrypt.compare("changeme", storedHash);
  expect(matches).toBe(true);
});

afterAll(async () => {
  await pool.end();
});