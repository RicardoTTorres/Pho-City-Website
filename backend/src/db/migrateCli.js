import mysql from "mysql2/promise";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getMigrationStatus, runMigrations } from "./migrationRunner.js";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const REMOTE_ACKNOWLEDGEMENT = "I_HAVE_A_BACKUP_AND_TESTED_STAGING";
const RDS_ACKNOWLEDGEMENT = "I_HAVE_REVIEWED_RDS_MIGRATION_STATUS";
const HELP_TEXT = `Usage: node src/db/migrateCli.js [up|status]

Commands:
  up       Apply pending migrations (default)
  status   Show applied and pending migrations without changing the schema

Options:
  -h, --help  Show this help message

Database commands require DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, and an
exact MIGRATION_CONFIRM_TARGET value. Remote and RDS targets require the
additional safety acknowledgements described in the project README.`;

function loadConfig(environment) {
  const config = {
    host: environment.DB_HOST,
    port: Number(environment.DB_PORT) || 3306,
    user: environment.DB_USER,
    password: environment.DB_PASS,
    database: environment.DB_NAME,
  };
  for (const [key, value] of Object.entries(config)) {
    if ((key !== "port" && !value) || (key === "port" && !Number.isInteger(value))) {
      throw new Error(`Missing or invalid migration database setting: ${key}`);
    }
  }
  return config;
}

function assertApprovedTarget(config, environment) {
  const target = `${config.host}:${config.port}/${config.database}`;
  if (environment.MIGRATION_CONFIRM_TARGET !== target) {
    throw new Error(
      `Set MIGRATION_CONFIRM_TARGET exactly to ${target} to approve this target`,
    );
  }

  if (
    !LOCAL_HOSTS.has(config.host) &&
    environment.MIGRATION_ALLOW_REMOTE !== REMOTE_ACKNOWLEDGEMENT
  ) {
    throw new Error(
      `Remote migration requires MIGRATION_ALLOW_REMOTE=${REMOTE_ACKNOWLEDGEMENT}`,
    );
  }

  if (
    config.host.toLowerCase().includes(".rds.amazonaws.com") &&
    environment.MIGRATION_ALLOW_RDS !== RDS_ACKNOWLEDGEMENT
  ) {
    throw new Error(
      `RDS migration requires MIGRATION_ALLOW_RDS=${RDS_ACKNOWLEDGEMENT}`,
    );
  }
  return target;
}

export async function runCli({
  args = process.argv.slice(2),
  environment = process.env,
  createConnection = mysql.createConnection,
  logger = console,
} = {}) {
  if (args.includes("--help") || args.includes("-h")) {
    logger.log(HELP_TEXT);
    return;
  }

  const command = args[0] ?? "up";
  if (!["up", "status"].includes(command)) {
    throw new Error(`Unknown migration command: ${command}`);
  }

  const config = loadConfig(environment);
  const target = assertApprovedTarget(config, environment);
  logger.log(`Migration target: ${target}`);
  const connection = await createConnection(config);
  try {
    const status = await getMigrationStatus(connection);
    for (const item of status) {
      const state = item.applied
        ? item.checksumMatches
          ? "applied"
          : "CHECKSUM MISMATCH"
        : "pending";
      logger.log(`${item.version} ${item.name}: ${state}`);
    }
    if (command === "up") {
      const applied = await runMigrations(connection);
      logger.log(
        applied.length
          ? `Applied migrations: ${applied.join(", ")}`
          : "No pending migrations.",
      );
    }
  } finally {
    await connection.end();
  }
}

const isDirectExecution =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runCli().catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}
