import { migrations } from "../../db/migrations/index.js";
import { pool } from "./connect_db.js";
import { getMigrationStatus } from "./migrationRunner.js";

const REQUIRED_COLUMNS = {
  about_section: [
    "about_id",
    "about_title",
    "about_description",
    "about_page_url",
    "about_image_url",
  ],
  about_page_content: [
    "id",
    "hero_title",
    "hero_intro",
    "hero_image_url",
    "beginning_title",
    "beginning_body",
    "beginning_image_url",
    "beginning_caption",
    "food_title",
    "food_body",
    "food_image_url",
    "food_caption",
    "food_highlights",
    "commitment_title",
    "commitment_body",
    "commitment_image_url",
    "commitment_caption",
    "closing_text",
    "preview_heading",
    "preview_body",
    "preview_button_label",
  ],
  contact_info: [
    "contact_id",
    "contact_address",
    "contact_city",
    "contact_state",
    "contact_zipcode",
    "contact_phone",
    "contact_email",
    "online_ordering_url",
  ],
  contact_submissions: [
    "id",
    "name",
    "email",
    "message",
    "submitted_at",
    "is_read",
    "ip_hash",
  ],
  hero_section: [
    "hero_id",
    "hero_main_title",
    "hero_subtitle",
    "hero_button_text",
    "hero_secondary_button_text",
    "hero_image_url",
  ],
  menu_categories: ["category_id", "category_name", "position"],
  menu_items: [
    "item_id",
    "item_name",
    "item_description",
    "item_price",
    "item_image_url",
    "item_is_visible",
    "category_id",
    "is_featured",
    "featured_position",
    "is_popular",
    "position",
  ],
  category_customization_groups: ["id", "category_id", "enabled"],
  customization_sections: ["id", "group_id", "title", "position"],
  customization_items: ["id", "section_id", "name", "price", "position"],
  admins: ["id", "email", "password_hash", "role", "created_at"],
  token_blacklist: ["jti", "expires_at"],
  password_resets: ["email", "code", "expires_at"],
  operating_hours: [
    "oh_id",
    "day_of_week",
    "open_time",
    "close_time",
    "restaurant_is_closed",
  ],
  ordering_links: ["platform_id", "platform_name", "platform_url"],
  site_settings: [
    "id",
    "footer_json",
    "navbar_json",
    "settings_json",
    "updated_at",
  ],
  activity_log: [
    "id",
    "action",
    "section",
    "description",
    "admin_email",
    "created_at",
  ],
  traffic_dates: ["date", "date_views"],
  traffic_pages: ["page", "page_views"],
  traffic_visitors: ["visitor_id"],
  gmail_accounts: [
    "id",
    "email",
    "access_token",
    "refresh_token",
    "scope",
    "token_type",
    "expiry_date",
  ],
  gmail_threads: ["email", "thread_id", "history_id"],
  gmail_messages: [
    "email",
    "message_id",
    "thread_id",
    "history_id",
    "is_preview",
    "is_unread",
    "snippet",
    "body",
    "date",
    "subject",
    "from_name",
    "from_email",
  ],
  imap_accounts: ["email", "app_pass"],
  imap_messages: ["email", "message_id", "is_preview", "snippet", "body"],
};

const REQUIRED_INDEXES = [
  ["menu_categories", "idx_menu_categories_position"],
  ["menu_items", "idx_menu_items_category_position"],
  ["menu_items", "idx_menu_items_featured_position"],
  ["contact_submissions", "idx_submitted_at"],
  ["activity_log", "idx_activity_created"],
  ["admins", "admins_email_unique"],
  ["token_blacklist", "idx_bl_expires"],
  ["gmail_messages", "idx_gmail_messages_thread_date"],
];

const REQUIRED_FOREIGN_KEYS = [
  ["menu_items", "menu_items_ibfk_1"],
  ["category_customization_groups", "fk_custgroup_cat"],
  ["customization_sections", "fk_section_group"],
  ["customization_items", "fk_custitem_section"],
];

const REQUIRED_COLUMN_SHAPES = [
  ["menu_categories", "position", "int unsigned", "NO", "0"],
  ["menu_items", "position", "int unsigned", "NO", "0"],
  ["menu_items", "is_popular", "tinyint(1)", "NO", "0"],
  ["admins", "role", "varchar(50)", "NO", "admin"],
  ["admins", "created_at", "timestamp", "YES", "CURRENT_TIMESTAMP"],
  ["gmail_threads", "history_id", "varchar(32)", "YES", null],
  ["gmail_messages", "history_id", "varchar(32)", "YES", null],
];

export async function validateDatabaseSchema(connection = pool) {
  const issues = [];
  const status = await getMigrationStatus(connection, migrations);
  for (const migration of status) {
    if (!migration.applied) {
      issues.push(`migration ${migration.version} is pending`);
    } else if (!migration.checksumMatches) {
      issues.push(`migration ${migration.version} checksum mismatch`);
    }
  }

  const [columnRows] = await connection.query(
    `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM information_schema.columns
      WHERE table_schema = DATABASE()`,
  );
  const columns = new Map(
    columnRows.map((row) => [
      `${row.TABLE_NAME}.${row.COLUMN_NAME}`,
      row,
    ]),
  );
  for (const [table, names] of Object.entries(REQUIRED_COLUMNS)) {
    for (const name of names) {
      if (!columns.has(`${table}.${name}`)) {
        issues.push(`missing column ${table}.${name}`);
      }
    }
  }
  for (const [table, column, type, nullable, defaultValue] of REQUIRED_COLUMN_SHAPES) {
    const existing = columns.get(`${table}.${column}`);
    if (!existing) continue;
    const actualDefault =
      existing.COLUMN_DEFAULT === null
        ? null
        : String(existing.COLUMN_DEFAULT);
    if (
      String(existing.COLUMN_TYPE).toLowerCase() !== type ||
      existing.IS_NULLABLE !== nullable ||
      actualDefault !== defaultValue
    ) {
      issues.push(`column shape mismatch ${table}.${column}`);
    }
  }

  const [indexRows] = await connection.query(
    `SELECT DISTINCT TABLE_NAME, INDEX_NAME
       FROM information_schema.statistics
      WHERE table_schema = DATABASE()`,
  );
  const indexes = new Set(
    indexRows.map((row) => `${row.TABLE_NAME}.${row.INDEX_NAME}`),
  );
  for (const [table, index] of REQUIRED_INDEXES) {
    if (!indexes.has(`${table}.${index}`)) {
      issues.push(`missing index ${table}.${index}`);
    }
  }

  const [foreignKeyRows] = await connection.query(
    `SELECT TABLE_NAME, CONSTRAINT_NAME
       FROM information_schema.table_constraints
      WHERE table_schema = DATABASE()
        AND constraint_type = 'FOREIGN KEY'`,
  );
  const foreignKeys = new Set(
    foreignKeyRows.map((row) => `${row.TABLE_NAME}.${row.CONSTRAINT_NAME}`),
  );
  for (const [table, constraint] of REQUIRED_FOREIGN_KEYS) {
    if (!foreignKeys.has(`${table}.${constraint}`)) {
      issues.push(`missing foreign key ${table}.${constraint}`);
    }
  }

  if (issues.length) {
    throw new Error(
      `Database schema validation failed:\n- ${issues.join(
        "\n- ",
      )}\nReview migration status and run the explicit controlled migration command before starting the application.`,
    );
  }
}
