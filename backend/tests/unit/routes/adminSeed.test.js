import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const originalEnvironment = { ...process.env };
let query;

beforeEach(() => {
  vi.resetModules();
  query = vi.fn();
  vi.doMock("../../../src/db/connect_db.js", () => ({
    pool: { query },
  }));
  vi.doMock("bcrypt", () => ({
    default: {
      hash: vi.fn(async () => "new-secure-hash"),
      compare: vi.fn(async (password, hash) => {
        return password === "changeme" && hash === "hash-of-changeme";
      }),
    },
  }));
  vi.doMock("dotenv", () => ({
    default: { config: vi.fn() },
  }));
  process.env.JWT_SECRET = "unit-test-secret";
  process.env.ADMIN_DEFAULT_EMAIL = "admin@example.test";
});

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.doUnmock("../../../src/db/connect_db.js");
  vi.doUnmock("bcrypt");
  vi.doUnmock("dotenv");
});

describe("default admin startup compatibility", () => {
  test("never overwrites an existing account", async () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_DEFAULT_PASSWORD = "local-password";
    query
      .mockResolvedValueOnce([[{ id: 7 }]])
      .mockResolvedValueOnce([[{ password_hash: "secure-hash" }]]);

    const { ensureDefaultAdmin } = await import("../../../src/routes/auth.js");
    await ensureDefaultAdmin();

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls.some(([sql]) => sql.includes("INSERT INTO admins"))).toBe(
      false,
    );
  }, 15_000);

  test("rejects insecure production seed credentials before querying", async () => {
    process.env.NODE_ENV = "production";
    process.env.ADMIN_DEFAULT_PASSWORD = "changeme";

    const { ensureDefaultAdmin } = await import("../../../src/routes/auth.js");
    await expect(ensureDefaultAdmin()).rejects.toThrow(
      "must not be the insecure default",
    );
    expect(query).not.toHaveBeenCalled();
  }, 15_000);

  test("rejects an existing insecure account in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.ADMIN_DEFAULT_PASSWORD = "secure-production-password";
    query
      .mockResolvedValueOnce([[{ id: 7 }]])
      .mockResolvedValueOnce([[{ password_hash: "hash-of-changeme" }]]);

    const { ensureDefaultAdmin } = await import("../../../src/routes/auth.js");
    await expect(ensureDefaultAdmin()).rejects.toThrow(
      "still uses the insecure default password",
    );
    expect(query.mock.calls.some(([sql]) => sql.includes("UPDATE admins"))).toBe(
      false,
    );
  }, 15_000);
});
