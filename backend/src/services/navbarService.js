import { pool } from "../db/connect_db.js";

const SITE_SETTINGS_ID = 1;

function getDefaultNavbar() {
  return {
    version: 1,
    updatedAt: null,
    updatedBy: null,
    i18n: {
      enabled: false,
      defaultLocale: "en",
      supportedLocales: ["en"],
    },
    brand: {
      name: "Pho City",
      logo: "",
    },
    links: [],
    ctas: {
      pickup: { enabled: false, label: { en: "Pickup" }, href: "" },
      delivery: { enabled: false, label: { en: "Delivery" }, href: "" },
    },
  };
}

export async function fetchNavbar() {
  const [rows] = await pool.query(
    "SELECT navbar_json FROM site_settings WHERE id = ?",
    [SITE_SETTINGS_ID],
  );

  if (!rows.length) {
    return getDefaultNavbar();
  }

  return rows[0].navbar_json ?? getDefaultNavbar();
}

export async function saveNavbar(navbarObject) {
  const payload = JSON.stringify(navbarObject);

  await pool.query("UPDATE site_settings SET navbar_json = ? WHERE id = ?", [
    payload,
    SITE_SETTINGS_ID,
  ]);

  return navbarObject;
}
