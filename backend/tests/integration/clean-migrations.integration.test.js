import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  configureApplicationEnvironment,
  connectDatabase,
  dropDatabase,
  recreateDatabase,
} from "./dbTestHarness.js";
import { verifyRepresentativeOperations } from "./appOperations.js";
import {
  getMigrationStatus,
  runMigrations,
} from "../../src/db/migrationRunner.js";

const DATABASE = "pho_city_migrations_empty_test";
let app;
let pool;

describe("clean installation through the full migration chain", () => {
  beforeAll(async () => {
    await recreateDatabase(DATABASE);
    const connection = await connectDatabase(DATABASE);
    try {
      const applied = await runMigrations(connection);
      expect(applied).toEqual(["001", "002", "003", "004", "005"]);
      const status = await getMigrationStatus(connection);
      expect(status.every((migration) => migration.applied)).toBe(true);
      expect(status.every((migration) => migration.checksumMatches)).toBe(true);
    } finally {
      await connection.end();
    }
    configureApplicationEnvironment(DATABASE);
    ({ default: app } = await import("../../src/server.js"));
    ({ pool } = await import("../../src/db/connect_db.js"));
  });

  afterAll(async () => {
    await pool?.end();
    await dropDatabase(DATABASE);
  });

  test("starts and supports auth, menu, and About operations", async () => {
    await verifyRepresentativeOperations(app);
  });
});
