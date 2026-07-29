import {
  ensureColumn,
  ensureIndex,
  ensureTable,
} from "../../src/db/schemaHelpers.js";

export const version = "003";
export const name = "settings_activity_and_analytics";
export const fileUrl = import.meta.url;

const DEFAULT_FOOTER = {
  contact: {
    phone: "(916) 754-2143",
    address: "6175 Stockton Blvd #200",
    cityZip: "Sacramento, CA 95824",
  },
  navLinks: [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/menu", label: "Menu" },
    { path: "/contact", label: "Contact" },
    {
      path: "https://order.toasttab.com/online/pho-city-6175-stockton-boulevard-200",
      label: "Order",
      external: true,
    },
  ],
  socialLinks: [
    { url: "https://instagram.com/", icon: "instagram", platform: "instagram" },
  ],
};

const DEFAULT_SETTINGS = {
  site: {
    siteName: "Pho City",
    tagline: "Authentic Vietnamese Cuisine",
    seoDescription:
      "Experience authentic Vietnamese flavors in Sacramento. Traditional pho, fresh rolls, and modern Vietnamese food.",
    googleAnalyticsId: "",
  },
  contact: {
    notificationEmail: "",
    emailNotificationsEnabled: false,
    storeSubmissions: true,
  },
  pdf: { menuLabel: "Download Menu", cacheTtlMinutes: 60 },
};

export async function up(connection) {
  await ensureTable(
    connection,
    "site_settings",
    `CREATE TABLE site_settings (
      id INT NOT NULL,
      footer_json JSON NOT NULL,
      navbar_json JSON NULL,
      settings_json JSON NULL,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureColumn(
    connection,
    "site_settings",
    "navbar_json",
    "JSON NULL",
  );
  await ensureColumn(
    connection,
    "site_settings",
    "settings_json",
    "JSON NULL",
  );
  await connection.query(
    `INSERT IGNORE INTO site_settings
      (id, footer_json, settings_json)
     VALUES (1, ?, ?)`,
    [JSON.stringify(DEFAULT_FOOTER), JSON.stringify(DEFAULT_SETTINGS)],
  );

  await ensureTable(
    connection,
    "activity_log",
    `CREATE TABLE activity_log (
      id INT NOT NULL AUTO_INCREMENT,
      action VARCHAR(20) NOT NULL,
      section VARCHAR(50) NOT NULL,
      description VARCHAR(255) NOT NULL,
      admin_email VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_activity_created (created_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureIndex(
    connection,
    "activity_log",
    "idx_activity_created",
    "created_at DESC",
  );

  await ensureTable(
    connection,
    "traffic_dates",
    `CREATE TABLE traffic_dates (
      date DATE NOT NULL,
      date_views INT NOT NULL,
      PRIMARY KEY (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureTable(
    connection,
    "traffic_pages",
    `CREATE TABLE traffic_pages (
      page VARCHAR(255) NOT NULL,
      page_views INT NOT NULL,
      PRIMARY KEY (page)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
  await ensureTable(
    connection,
    "traffic_visitors",
    `CREATE TABLE traffic_visitors (
      visitor_id CHAR(36) NOT NULL,
      PRIMARY KEY (visitor_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
  );
}
