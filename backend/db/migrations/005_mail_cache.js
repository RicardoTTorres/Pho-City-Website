import {
  ensureColumnShape,
  ensureIndex,
  ensureTable,
} from "../../src/db/schemaHelpers.js";

export const version = "005";
export const name = "mail_cache";
export const fileUrl = import.meta.url;

export async function up(connection) {
  await ensureTable(
    connection,
    "gmail_accounts",
    `CREATE TABLE gmail_accounts (
      id INT NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      scope TEXT,
      token_type VARCHAR(50),
      expiry_date BIGINT,
      PRIMARY KEY (id),
      UNIQUE KEY gmail_accounts_email_unique (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );

  await ensureTable(
    connection,
    "gmail_threads",
    `CREATE TABLE gmail_threads (
      email VARCHAR(255) NOT NULL,
      thread_id VARCHAR(255) NOT NULL,
      history_id VARCHAR(32) DEFAULT NULL,
      PRIMARY KEY (email, thread_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumnShape(connection, "gmail_threads", "history_id", {
    definition: "VARCHAR(32) DEFAULT NULL",
    type: "varchar(32)",
    nullable: true,
    defaultValue: null,
  });

  await ensureTable(
    connection,
    "gmail_messages",
    `CREATE TABLE gmail_messages (
      email VARCHAR(255) NOT NULL,
      message_id VARCHAR(255) NOT NULL,
      thread_id VARCHAR(255),
      history_id VARCHAR(32) DEFAULT NULL,
      is_preview BOOLEAN NOT NULL,
      is_unread BOOLEAN NOT NULL,
      snippet TEXT,
      body TEXT,
      date DATETIME,
      subject TEXT,
      from_name TEXT,
      from_email VARCHAR(255),
      PRIMARY KEY (email, message_id),
      KEY idx_gmail_messages_thread_date (email, thread_id, date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumnShape(connection, "gmail_messages", "history_id", {
    definition: "VARCHAR(32) DEFAULT NULL",
    type: "varchar(32)",
    nullable: true,
    defaultValue: null,
  });
  await ensureIndex(
    connection,
    "gmail_messages",
    "idx_gmail_messages_thread_date",
    "email, thread_id, date",
  );

  await ensureTable(
    connection,
    "imap_accounts",
    `CREATE TABLE imap_accounts (
      email VARCHAR(255) NOT NULL,
      app_pass VARCHAR(50),
      PRIMARY KEY (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureTable(
    connection,
    "imap_messages",
    `CREATE TABLE imap_messages (
      email VARCHAR(255) NOT NULL,
      message_id VARCHAR(255) NOT NULL,
      is_preview BOOLEAN NOT NULL,
      snippet TEXT,
      body TEXT,
      PRIMARY KEY (email, message_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
}
