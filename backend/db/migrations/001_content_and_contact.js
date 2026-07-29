import {
  ensureColumn,
  ensureColumnShape,
  ensureIndex,
  ensureTable,
} from "../../src/db/schemaHelpers.js";

export const version = "001";
export const name = "content_and_contact";
export const fileUrl = import.meta.url;

export async function up(connection) {
  await ensureTable(
    connection,
    "about_section",
    `CREATE TABLE about_section (
      about_id INT NOT NULL AUTO_INCREMENT,
      about_title VARCHAR(150) DEFAULT NULL,
      about_description TEXT,
      about_page_url VARCHAR(255) DEFAULT NULL,
      about_image_url VARCHAR(512) DEFAULT NULL,
      PRIMARY KEY (about_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumn(
    connection,
    "about_section",
    "about_image_url",
    "VARCHAR(512) DEFAULT NULL",
  );

  await ensureTable(
    connection,
    "about_page_content",
    `CREATE TABLE about_page_content (
      id INT NOT NULL AUTO_INCREMENT,
      hero_title VARCHAR(150) DEFAULT NULL,
      hero_intro TEXT,
      hero_image_url VARCHAR(512) DEFAULT NULL,
      beginning_title VARCHAR(150) DEFAULT NULL,
      beginning_body TEXT,
      beginning_image_url VARCHAR(512) DEFAULT NULL,
      beginning_caption VARCHAR(255) DEFAULT NULL,
      food_title VARCHAR(150) DEFAULT NULL,
      food_body TEXT,
      food_image_url VARCHAR(512) DEFAULT NULL,
      food_caption VARCHAR(255) DEFAULT NULL,
      food_highlights TEXT,
      commitment_title VARCHAR(150) DEFAULT NULL,
      commitment_body TEXT,
      commitment_image_url VARCHAR(512) DEFAULT NULL,
      commitment_caption VARCHAR(255) DEFAULT NULL,
      closing_text TEXT,
      preview_heading VARCHAR(150) DEFAULT NULL,
      preview_body TEXT,
      preview_button_label VARCHAR(100) DEFAULT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );

  const aboutColumns = [
    ["hero_title", "VARCHAR(150) DEFAULT NULL"],
    ["hero_intro", "TEXT"],
    ["hero_image_url", "VARCHAR(512) DEFAULT NULL"],
    ["beginning_title", "VARCHAR(150) DEFAULT NULL"],
    ["beginning_body", "TEXT"],
    ["beginning_image_url", "VARCHAR(512) DEFAULT NULL"],
    ["beginning_caption", "VARCHAR(255) DEFAULT NULL"],
    ["food_title", "VARCHAR(150) DEFAULT NULL"],
    ["food_body", "TEXT"],
    ["food_image_url", "VARCHAR(512) DEFAULT NULL"],
    ["food_caption", "VARCHAR(255) DEFAULT NULL"],
    ["food_highlights", "TEXT"],
    ["commitment_title", "VARCHAR(150) DEFAULT NULL"],
    ["commitment_body", "TEXT"],
    ["commitment_image_url", "VARCHAR(512) DEFAULT NULL"],
    ["commitment_caption", "VARCHAR(255) DEFAULT NULL"],
    ["closing_text", "TEXT"],
    ["preview_heading", "VARCHAR(150) DEFAULT NULL"],
    ["preview_body", "TEXT"],
    ["preview_button_label", "VARCHAR(100) DEFAULT NULL"],
  ];
  for (const [column, definition] of aboutColumns) {
    await ensureColumn(
      connection,
      "about_page_content",
      column,
      definition,
    );
  }

  await connection.query(
    `INSERT INTO about_page_content
      (hero_title, hero_intro, hero_image_url)
     SELECT about_title, about_description, about_image_url
       FROM about_section
      WHERE NOT EXISTS (SELECT 1 FROM about_page_content)
      LIMIT 1`,
  );

  await ensureTable(
    connection,
    "contact_info",
    `CREATE TABLE contact_info (
      contact_id INT NOT NULL AUTO_INCREMENT,
      contact_address VARCHAR(255) DEFAULT NULL,
      contact_city VARCHAR(100) DEFAULT NULL,
      contact_state VARCHAR(50) DEFAULT NULL,
      contact_zipcode VARCHAR(10) DEFAULT NULL,
      contact_phone VARCHAR(50) DEFAULT NULL,
      contact_email VARCHAR(100) DEFAULT NULL,
      online_ordering_url VARCHAR(512) DEFAULT NULL,
      PRIMARY KEY (contact_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumn(
    connection,
    "contact_info",
    "online_ordering_url",
    "VARCHAR(512) DEFAULT NULL",
  );

  await ensureTable(
    connection,
    "contact_submissions",
    `CREATE TABLE contact_submissions (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      ip_hash VARCHAR(64) NULL,
      PRIMARY KEY (id),
      KEY idx_submitted_at (submitted_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureIndex(
    connection,
    "contact_submissions",
    "idx_submitted_at",
    "submitted_at DESC",
  );

  await ensureTable(
    connection,
    "hero_section",
    `CREATE TABLE hero_section (
      hero_id INT NOT NULL AUTO_INCREMENT,
      hero_main_title VARCHAR(150) DEFAULT NULL,
      hero_subtitle TEXT,
      hero_button_text VARCHAR(100) DEFAULT NULL,
      hero_secondary_button_text VARCHAR(255) DEFAULT NULL,
      hero_image_url VARCHAR(512) DEFAULT NULL,
      PRIMARY KEY (hero_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumnShape(connection, "hero_section", "hero_image_url", {
    definition: "VARCHAR(512) DEFAULT NULL",
    type: "varchar(512)",
    nullable: true,
    defaultValue: null,
  });

  await ensureTable(
    connection,
    "operating_hours",
    `CREATE TABLE operating_hours (
      oh_id INT NOT NULL AUTO_INCREMENT,
      day_of_week VARCHAR(15) DEFAULT NULL,
      open_time TIME DEFAULT NULL,
      close_time TIME DEFAULT NULL,
      restaurant_is_closed TINYINT(1) DEFAULT 0,
      PRIMARY KEY (oh_id),
      UNIQUE KEY day_of_week (day_of_week)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );

  await ensureTable(
    connection,
    "ordering_links",
    `CREATE TABLE ordering_links (
      platform_id INT NOT NULL AUTO_INCREMENT,
      platform_name VARCHAR(50) DEFAULT NULL,
      platform_url VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (platform_id),
      UNIQUE KEY platform_name (platform_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
}
