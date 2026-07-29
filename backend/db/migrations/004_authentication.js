import {
  ensureColumnShape,
  ensureIndex,
  ensureTable,
} from "../../src/db/schemaHelpers.js";

export const version = "004";
export const name = "authentication";
export const fileUrl = import.meta.url;

export async function up(connection) {
  await ensureTable(
    connection,
    "admins",
    `CREATE TABLE admins (
      id INT NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY admins_email_unique (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureIndex(
    connection,
    "admins",
    "admins_email_unique",
    "email",
    { unique: true },
  );
  await ensureColumnShape(connection, "admins", "role", {
    definition: "VARCHAR(50) NOT NULL DEFAULT 'admin'",
    type: "varchar(50)",
    nullable: false,
    defaultValue: "admin",
  });
  await ensureColumnShape(connection, "admins", "created_at", {
    definition: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
    type: "timestamp",
    nullable: true,
    defaultValue: "CURRENT_TIMESTAMP",
  });

  await ensureTable(
    connection,
    "token_blacklist",
    `CREATE TABLE token_blacklist (
      jti VARCHAR(36) NOT NULL,
      expires_at DATETIME NOT NULL,
      PRIMARY KEY (jti),
      KEY idx_bl_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureIndex(
    connection,
    "token_blacklist",
    "idx_bl_expires",
    "expires_at",
  );

  await ensureTable(
    connection,
    "password_resets",
    `CREATE TABLE password_resets (
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at DATETIME NOT NULL,
      PRIMARY KEY (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
}
