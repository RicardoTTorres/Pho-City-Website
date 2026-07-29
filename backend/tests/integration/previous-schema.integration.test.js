import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import {
  applySqlFile,
  connectDatabase,
  dropDatabase,
  recreateDatabase,
} from "./dbTestHarness.js";
import {
  getMigrationStatus,
  runMigrations,
} from "../../src/db/migrationRunner.js";
import { validateDatabaseSchema } from "../../src/db/validateSchema.js";

const DATABASE = "pho_city_migrations_upgrade_test";
let connection;

describe("upgrade from the immediate previous schema", () => {
  beforeAll(async () => {
    await recreateDatabase(DATABASE);
    connection = await connectDatabase(DATABASE);
    await applySqlFile(
      connection,
      new URL("../fixtures/pre-migration-schema.sql", import.meta.url),
    );
  });

  afterAll(async () => {
    await connection?.end();
    await dropDatabase(DATABASE);
  });

  test("preserves data and applies each migration exactly once", async () => {
    await expect(validateDatabaseSchema(connection)).rejects.toThrow(
      "migration 001 is pending",
    );
    const [[beforeLedger]] = await connection.query(
      `SELECT COUNT(*) AS count
         FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = 'schema_migrations'`,
    );
    expect(beforeLedger.count).toBe(0);

    const logger = { info: vi.fn() };
    expect(await runMigrations(connection, { logger })).toEqual([
      "001",
      "002",
      "003",
      "004",
      "005",
    ]);
    expect(await runMigrations(connection, { logger })).toEqual([]);
    expect(logger.info).toHaveBeenCalledTimes(5);

    const status = await getMigrationStatus(connection);
    expect(status.every((migration) => migration.applied)).toBe(true);
    expect(status.every((migration) => migration.checksumMatches)).toBe(true);

    const [[about]] = await connection.query(
      "SELECT hero_title, beginning_image_url FROM about_page_content WHERE id = 1",
    );
    expect(about).toEqual({
      hero_title: "Preserve Me",
      beginning_image_url: null,
    });

    const [[item]] = await connection.query(
      `SELECT item_name, item_price, position, is_popular
         FROM menu_items WHERE item_id = 42`,
    );
    expect(item.item_name).toBe("Preserved Item");
    expect(Number(item.item_price)).toBe(9.5);
    expect(item.position).toBe(0);
    expect(item.is_popular).toBe(0);

    const [[gmail]] = await connection.query(
      `SELECT history_id
         FROM gmail_messages
        WHERE email = 'cache@example.test' AND message_id = 'message-1'`,
    );
    expect(gmail.history_id).toBe("2147483647");

    const [[shape]] = await connection.query(
      `SELECT COLUMN_TYPE
         FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'gmail_messages'
          AND column_name = 'history_id'`,
    );
    expect(shape.COLUMN_TYPE).toBe("varchar(32)");
  });
});
