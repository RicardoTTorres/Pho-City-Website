import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  applySqlFile,
  connectDatabase,
  dropDatabase,
  recreateDatabase,
} from "./dbTestHarness.js";
import { runMigrations } from "../../src/db/migrationRunner.js";

const DATABASE = "pho_city_legacy_upgrade_test";
let connection;

describe("upgrade from the destructive archived legacy fixture", () => {
  beforeAll(async () => {
    await recreateDatabase(DATABASE);
    connection = await connectDatabase(DATABASE);
    await applySqlFile(
      connection,
      new URL("../fixtures/legacy-init.sql", import.meta.url),
    );
  });

  afterAll(async () => {
    await connection?.end();
    await dropDatabase(DATABASE);
  });

  test("preserves legacy rows and reaches the current application schema", async () => {
    const [[before]] = await connection.query(
      "SELECT COUNT(*) AS count FROM menu_items",
    );
    expect(before.count).toBe(121);

    await runMigrations(connection);

    const [[after]] = await connection.query(
      "SELECT COUNT(*) AS count FROM menu_items",
    );
    expect(after.count).toBe(before.count);

    const [[sentinel]] = await connection.query(
      "SELECT item_name, item_price, position, is_popular FROM menu_items WHERE item_id = 1",
    );
    expect(sentinel.item_name).toContain("Grilled Pork Sandwich");
    expect(Number(sentinel.item_price)).toBe(9);
    expect(sentinel.position).toBe(0);
    expect(sentinel.is_popular).toBe(0);

    const [requiredTables] = await connection.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name IN (
            'about_page_content',
            'contact_submissions',
            'category_customization_groups',
            'activity_log',
            'token_blacklist',
            'password_resets',
            'gmail_accounts',
            'imap_accounts'
          )`,
    );
    expect(requiredTables).toHaveLength(8);
  });
});
