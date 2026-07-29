import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const DATABASE_PATTERN = /^pho_city_[a-z0-9_]*_test$/;

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Integration tests require ${name}`);
  return value;
}

export function integrationConfig(database) {
  if (
    process.env.NODE_ENV !== "test" ||
    process.env.RUN_DB_INTEGRATION_TESTS !== "true"
  ) {
    throw new Error(
      "Destructive database setup requires NODE_ENV=test and RUN_DB_INTEGRATION_TESTS=true",
    );
  }

  const host = requiredEnvironment("TEST_DB_HOST");
  const approvedCiHost = process.env.TEST_DB_APPROVED_CI_HOST;
  if (host.toLowerCase().includes(".rds.amazonaws.com")) {
    throw new Error("RDS hosts are forbidden for integration tests");
  }
  if (!LOCAL_HOSTS.has(host) && host !== approvedCiHost) {
    throw new Error(
      "Integration-test host must be local or exactly match TEST_DB_APPROVED_CI_HOST",
    );
  }

  const approvedDatabases = new Set(
    requiredEnvironment("TEST_DB_APPROVED_DATABASES")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
  );
  if (!DATABASE_PATTERN.test(database) || !approvedDatabases.has(database)) {
    throw new Error(
      `Database ${database} is not an explicitly approved integration-test database`,
    );
  }

  return {
    host,
    port: Number(process.env.TEST_DB_PORT) || 3306,
    user: requiredEnvironment("TEST_DB_USER"),
    password: process.env.TEST_DB_PASS ?? "",
    database,
  };
}

function quoteDatabase(database) {
  if (!DATABASE_PATTERN.test(database)) {
    throw new Error(`Unsafe integration-test database name: ${database}`);
  }
  return `\`${database}\``;
}

export async function recreateDatabase(database) {
  const config = integrationConfig(database);
  console.log(
    `Destructive integration-test setup approved for ${config.host}:${config.port}/${database}`,
  );
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });
  try {
    await connection.query(`DROP DATABASE IF EXISTS ${quoteDatabase(database)}`);
    await connection.query(
      `CREATE DATABASE ${quoteDatabase(
        database,
      )} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
    );
  } finally {
    await connection.end();
  }
  return config;
}

export async function dropDatabase(database) {
  const config = integrationConfig(database);
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });
  try {
    await connection.query(`DROP DATABASE IF EXISTS ${quoteDatabase(database)}`);
  } finally {
    await connection.end();
  }
}

export async function connectDatabase(database) {
  const config = integrationConfig(database);
  return mysql.createConnection({ ...config, multipleStatements: true });
}

export async function applySqlFile(connection, path) {
  const sql = await readFile(path, "utf8");
  await connection.query(sql);
}

export function configureApplicationEnvironment(database) {
  const config = integrationConfig(database);
  process.env.DB_HOST = config.host;
  process.env.DB_PORT = String(config.port);
  process.env.DB_USER = config.user;
  process.env.DB_PASS = config.password;
  process.env.DB_NAME = database;
  process.env.JWT_SECRET = "integration-test-jwt-secret";
  process.env.ADMIN_DEFAULT_EMAIL = "integration-admin@phocity.test";
  process.env.ADMIN_DEFAULT_PASSWORD = "integration-test-password";
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
  process.env.GMAIL_USER = "";
  process.env.GMAIL_PASS = "";
  process.env.CLIENT_ID = "";
  process.env.CLIENT_SECRET = "";
}
