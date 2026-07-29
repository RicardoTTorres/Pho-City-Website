import {
  ensureColumn,
  ensureColumnShape,
  ensureIndex,
  ensureTable,
} from "../../src/db/schemaHelpers.js";

export const version = "002";
export const name = "menu_and_customization";
export const fileUrl = import.meta.url;

async function backfillCategoryPositions(connection) {
  const [rows] = await connection.query(
    `SELECT category_id, position
       FROM menu_categories
      ORDER BY category_id`,
  );
  let nextPosition = rows.reduce(
    (max, row) =>
      row.position === null ? max : Math.max(max, Number(row.position)),
    -1,
  );
  for (const row of rows) {
    if (row.position === null) {
      nextPosition += 1;
      await connection.query(
        "UPDATE menu_categories SET position = ? WHERE category_id = ?",
        [nextPosition, row.category_id],
      );
    }
  }
}

async function backfillItemPositions(connection) {
  const [rows] = await connection.query(
    `SELECT item_id, category_id, position
       FROM menu_items
      ORDER BY category_id, item_id`,
  );
  const nextByCategory = new Map();
  for (const row of rows) {
    const key = row.category_id === null ? "__null__" : String(row.category_id);
    if (row.position !== null) {
      nextByCategory.set(
        key,
        Math.max(nextByCategory.get(key) ?? -1, Number(row.position)),
      );
    }
  }
  for (const row of rows) {
    if (row.position !== null) continue;
    const key = row.category_id === null ? "__null__" : String(row.category_id);
    const nextPosition = (nextByCategory.get(key) ?? -1) + 1;
    nextByCategory.set(key, nextPosition);
    await connection.query(
      "UPDATE menu_items SET position = ? WHERE item_id = ?",
      [nextPosition, row.item_id],
    );
  }
}

export async function up(connection) {
  await ensureTable(
    connection,
    "menu_categories",
    `CREATE TABLE menu_categories (
      category_id INT NOT NULL AUTO_INCREMENT,
      category_name VARCHAR(100) DEFAULT NULL,
      position INT UNSIGNED NOT NULL DEFAULT 0,
      PRIMARY KEY (category_id),
      UNIQUE KEY category_name (category_name),
      KEY idx_menu_categories_position (position, category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumn(
    connection,
    "menu_categories",
    "position",
    "INT UNSIGNED NULL",
  );
  await backfillCategoryPositions(connection);
  await ensureColumnShape(connection, "menu_categories", "position", {
    definition: "INT UNSIGNED NOT NULL DEFAULT 0",
    type: "int unsigned",
    nullable: false,
    defaultValue: 0,
  });
  await ensureIndex(
    connection,
    "menu_categories",
    "idx_menu_categories_position",
    "position, category_id",
  );

  await ensureTable(
    connection,
    "menu_items",
    `CREATE TABLE menu_items (
      item_id INT NOT NULL AUTO_INCREMENT,
      item_name VARCHAR(100) NOT NULL,
      item_description TEXT,
      item_price DECIMAL(6,2) DEFAULT NULL,
      item_image_url VARCHAR(512) DEFAULT NULL,
      item_is_visible TINYINT(1) DEFAULT 1,
      category_id INT DEFAULT NULL,
      is_featured TINYINT(1) DEFAULT 0,
      featured_position TINYINT DEFAULT NULL,
      is_popular TINYINT(1) NOT NULL DEFAULT 0,
      position INT UNSIGNED NOT NULL DEFAULT 0,
      PRIMARY KEY (item_id),
      KEY category_id (category_id),
      KEY idx_menu_items_category_position (category_id, position, item_id),
      KEY idx_menu_items_featured_position
        (is_featured, item_is_visible, featured_position),
      CONSTRAINT menu_items_ibfk_1
        FOREIGN KEY (category_id) REFERENCES menu_categories (category_id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumnShape(connection, "menu_items", "item_image_url", {
    definition: "VARCHAR(512) DEFAULT NULL",
    type: "varchar(512)",
    nullable: true,
    defaultValue: null,
  });
  await ensureColumn(
    connection,
    "menu_items",
    "featured_position",
    "TINYINT DEFAULT NULL",
  );
  await ensureColumn(
    connection,
    "menu_items",
    "is_popular",
    "TINYINT(1) NOT NULL DEFAULT 0",
  );
  await ensureColumn(connection, "menu_items", "position", "INT UNSIGNED NULL");
  await backfillItemPositions(connection);
  await ensureColumnShape(connection, "menu_items", "position", {
    definition: "INT UNSIGNED NOT NULL DEFAULT 0",
    type: "int unsigned",
    nullable: false,
    defaultValue: 0,
  });
  await ensureColumnShape(connection, "menu_items", "is_popular", {
    definition: "TINYINT(1) NOT NULL DEFAULT 0",
    type: "tinyint(1)",
    nullable: false,
    defaultValue: 0,
  });
  await ensureIndex(
    connection,
    "menu_items",
    "idx_menu_items_category_position",
    "category_id, position, item_id",
  );
  await ensureIndex(
    connection,
    "menu_items",
    "idx_menu_items_featured_position",
    "is_featured, item_is_visible, featured_position",
  );

  await ensureTable(
    connection,
    "category_customization_groups",
    `CREATE TABLE category_customization_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      enabled TINYINT(1) NOT NULL DEFAULT 1,
      UNIQUE KEY uq_custgroup_category (category_id),
      CONSTRAINT fk_custgroup_cat
        FOREIGN KEY (category_id) REFERENCES menu_categories (category_id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureTable(
    connection,
    "customization_sections",
    `CREATE TABLE customization_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      group_id INT NOT NULL,
      title VARCHAR(100) NOT NULL,
      position TINYINT UNSIGNED NOT NULL DEFAULT 0,
      CONSTRAINT fk_section_group
        FOREIGN KEY (group_id) REFERENCES category_customization_groups (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureTable(
    connection,
    "customization_items",
    `CREATE TABLE customization_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      price VARCHAR(20) DEFAULT NULL,
      position TINYINT UNSIGNED NOT NULL DEFAULT 0,
      CONSTRAINT fk_custitem_section
        FOREIGN KEY (section_id) REFERENCES customization_sections (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
}
