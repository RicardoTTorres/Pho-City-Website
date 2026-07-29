import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { migrations as defaultMigrations } from "../../db/migrations/index.js";
import { tableExists } from "./schemaHelpers.js";

const MIGRATION_LOCK = "pho_city_schema_migrations";

export async function migrationChecksum(migration) {
  const source = await readFile(fileURLToPath(migration.fileUrl));
  return createHash("sha256").update(source).digest("hex");
}

async function ensureLedger(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(20) NOT NULL,
      name VARCHAR(150) NOT NULL,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

async function readApplied(connection) {
  if (!(await tableExists(connection, "schema_migrations"))) return new Map();
  const [rows] = await connection.query(
    "SELECT version, name, checksum, applied_at FROM schema_migrations",
  );
  return new Map(rows.map((row) => [String(row.version), row]));
}

export async function getMigrationStatus(
  connection,
  migrations = defaultMigrations,
) {
  const applied = await readApplied(connection);
  const status = [];
  for (const migration of migrations) {
    const checksum = await migrationChecksum(migration);
    const existing = applied.get(migration.version);
    status.push({
      version: migration.version,
      name: migration.name,
      checksum,
      applied: Boolean(existing),
      checksumMatches: !existing || existing.checksum === checksum,
      appliedAt: existing?.applied_at ?? null,
    });
  }
  return status;
}

export async function runMigrations(
  connection,
  { migrations = defaultMigrations, logger = console } = {},
) {
  const [[lockRow]] = await connection.query(
    "SELECT GET_LOCK(?, 30) AS acquired",
    [MIGRATION_LOCK],
  );
  if (Number(lockRow.acquired) !== 1) {
    throw new Error("Could not acquire the schema migration lock");
  }

  const appliedVersions = [];
  try {
    await ensureLedger(connection);
    const applied = await readApplied(connection);

    for (const migration of migrations) {
      const checksum = await migrationChecksum(migration);
      const existing = applied.get(migration.version);
      if (existing) {
        if (existing.checksum !== checksum) {
          throw new Error(
            `Migration ${migration.version} checksum does not match the applied ledger entry`,
          );
        }
        continue;
      }

      logger.info?.(
        `Applying migration ${migration.version} ${migration.name}`,
      );
      await migration.up(connection);
      await connection.query(
        `INSERT INTO schema_migrations (version, name, checksum)
         VALUES (?, ?, ?)`,
        [migration.version, migration.name, checksum],
      );
      appliedVersions.push(migration.version);
    }
    return appliedVersions;
  } finally {
    await connection.query("SELECT RELEASE_LOCK(?)", [MIGRATION_LOCK]);
  }
}
