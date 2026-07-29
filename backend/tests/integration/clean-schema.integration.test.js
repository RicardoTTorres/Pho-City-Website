import { afterAll, beforeAll, describe, test } from "vitest";
import {
  applySqlFile,
  configureApplicationEnvironment,
  connectDatabase,
  dropDatabase,
  recreateDatabase,
} from "./dbTestHarness.js";
import { verifyRepresentativeOperations } from "./appOperations.js";

const DATABASE = "pho_city_schema_test";
let app;
let pool;

describe("clean installation through schema.sql", () => {
  beforeAll(async () => {
    await recreateDatabase(DATABASE);
    const connection = await connectDatabase(DATABASE);
    try {
      await applySqlFile(
        connection,
        new URL("../../db/schema.sql", import.meta.url),
      );
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
