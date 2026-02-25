// src/services/menuPdfService.js
import { fileURLToPath } from "url";
import path from "path";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import { pool } from "../db/connect_db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_PUBLIC = path.resolve(__dirname, "../../../frontend/public");
const FONTS_DIR = path.join(FRONTEND_PUBLIC, "fonts");
const LOGO_PATH = path.join(FRONTEND_PUBLIC, "logo.png");

Font.register({
  family: "NotoSans",
  fonts: [
    { src: path.join(FONTS_DIR, "NotoSans-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(FONTS_DIR, "NotoSans-Bold.ttf"), fontWeight: "bold" },
    { src: path.join(FONTS_DIR, "NotoSans-Italic.ttf"), fontStyle: "italic" },
  ],
});

const BRAND = {
  red: "#A31D24",
  gold: "#E2A818",
  cream: "#FFF8F0",
  charcoal: "#231E1C",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: BRAND.cream,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "NotoSans",
    color: BRAND.charcoal,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  logo: { width: 72, height: 72, marginRight: 14 },
  headerText: { flex: 1 },
  brandName: {
    fontSize: 22,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    color: BRAND.red,
  },
  subtitle: {
    fontSize: 10,
    color: BRAND.gold,
    fontFamily: "NotoSans",
    fontStyle: "italic",
    marginTop: 2,
  },
  divider: { height: 2, backgroundColor: BRAND.gold, marginVertical: 8 },
  contactBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 6,
  },
  contactText: { fontSize: 9, color: BRAND.charcoal },
  hoursSection: { marginBottom: 12 },
  hoursTitle: {
    fontSize: 10,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    color: BRAND.red,
    textAlign: "center",
    marginBottom: 4,
  },
  hoursGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  hoursEntry: { flexDirection: "row", width: "25%", fontSize: 8 },
  hoursDay: { fontFamily: "NotoSans", fontWeight: "bold", width: 28 },
  hoursTime: { flex: 1 },
  categoryHeader: {
    fontSize: 14,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    color: BRAND.red,
    marginTop: 10,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.gold,
  },
  itemRow: {
    paddingLeft: 4,
    marginBottom: 4,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    flexGrow: 0,
    flexShrink: 0,
  },
  itemNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexGrow: 0,
    flexShrink: 0,
  },
  itemEnglish: {
    fontSize: 10,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    color: BRAND.charcoal,
    flex: 1,
    lineHeight: 1,
  },
  itemPrice: {
    fontSize: 10,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    color: BRAND.red,
    marginLeft: 8,
    lineHeight: 1,
  },
  itemVietnamese: {
    fontSize: 8,
    fontFamily: "NotoSans",
    fontStyle: "italic",
    color: BRAND.gold,
    marginTop: 0,
    lineHeight: 1,
    flexGrow: 0,
    flexShrink: 0,
  },
  itemDescription: {
    fontSize: 8,
    color: "#666666",
    marginTop: 1,
    lineHeight: 1,
    flexGrow: 0,
    flexShrink: 0,
  },
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#999999",
  },
});

function parseBilingualName(name) {
  const raw = (name ?? "").trim();
  const match = raw.match(/^\[([^\]]+)\]\s*(.+)$/);
  if (!match) return { vietnamese: null, english: raw };
  return {
    vietnamese: match[1]?.trim() || null,
    english: match[2]?.trim() || raw,
  };
}

function formatPrice(price) {
  const num = parseFloat((price || "0").toString().replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : "";
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

async function fetchPdfData() {
  const [categories] = await pool.query(`
    SELECT category_id AS id, category_name AS name
    FROM menu_categories
    ORDER BY position ASC, category_id ASC
  `);

  const [items] = await pool.query(`
    SELECT item_id AS id, item_name AS name, item_description AS description,
           item_price AS price, category_id
    FROM menu_items
    WHERE item_is_visible = 1
    ORDER BY category_id ASC, position ASC, item_id ASC
  `);

  const menuCategories = categories.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    items: items
      .filter((i) => i.category_id === cat.id)
      .map((i) => ({
        id: String(i.id),
        name: i.name,
        description: i.description,
        price: `$${Number(i.price).toFixed(2)}`,
      })),
  }));

  const [footerRows] = await pool.query(
    "SELECT footer_json FROM site_settings WHERE id = 1 LIMIT 1",
  );
  const footer =
    footerRows.length > 0
      ? typeof footerRows[0].footer_json === "string"
        ? JSON.parse(footerRows[0].footer_json)
        : footerRows[0].footer_json
      : null;

  const [contactRows] = await pool.query(`
    SELECT contact_phone, contact_address, contact_city, contact_state, contact_zipcode
    FROM contact_info LIMIT 1
  `);
  const [hoursRows] = await pool.query(`
    SELECT day_of_week, open_time, close_time, restaurant_is_closed
    FROM operating_hours ORDER BY oh_id
  `);

  const contact = contactRows[0] || {};
  const hours = {};
  for (const h of hoursRows) {
    hours[h.day_of_week] = h.restaurant_is_closed
      ? "Closed"
      : `${formatTime(h.open_time)} \u2013 ${formatTime(h.close_time)}`;
  }

  const cityRaw = [
    contact.contact_city,
    contact.contact_state,
    contact.contact_zipcode,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    categories: menuCategories,
    restaurantName: footer?.brand?.name ?? "Pho City",
    address:
      footer?.contact?.address ?? contact.contact_address ?? "",
    cityZip: footer?.contact?.cityZip ?? cityRaw,
    phone: footer?.contact?.phone ?? contact.contact_phone ?? "",
    hours,
  };
}

function buildDocument({ categories, restaurantName, address, cityZip, phone, hours }) {
  const el = React.createElement;

  const DAY_ABBR = {
    Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
    Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
  };
  const DAY_ORDER = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  ];

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const categoryElements = categories
    .map((category) => {
      const visibleItems = (category.items ?? []).filter(
        (item) => item.visible !== false,
      );
      if (visibleItems.length === 0) return null;

      const itemElements = visibleItems.map((item) => {
        const { english, vietnamese } = parseBilingualName(item.name);
        const rowChildren = [
          el(View, { key: "nameRow", style: styles.itemNameRow },
            el(Text, { style: styles.itemEnglish }, english),
            el(Text, { style: styles.itemPrice }, formatPrice(item.price)),
          ),
        ];
        if (vietnamese) {
          rowChildren.push(
            el(Text, { key: "vi", style: styles.itemVietnamese }, vietnamese),
          );
        }
        if (item.description) {
          rowChildren.push(
            el(Text, { key: "desc", style: styles.itemDescription }, item.description),
          );
        }
        return el(
          View,
          { key: item.id || item.name, style: styles.itemRow, wrap: false },
          ...rowChildren,
        );
      });

      return el(
        View,
        { key: category.id || category.name },
        el(Text, { style: styles.categoryHeader }, category.name),
        ...itemElements,
      );
    })
    .filter(Boolean);

  const hoursEntries = DAY_ORDER.map((day) =>
    el(View, { key: day, style: styles.hoursEntry },
      el(Text, { style: styles.hoursDay }, DAY_ABBR[day]),
      el(Text, { style: styles.hoursTime }, hours[day] || "Closed"),
    ),
  );

  return el(
    Document,
    { title: `${restaurantName} Menu`, author: restaurantName },
    el(Page, { size: "LETTER", style: styles.page },
      el(View, { style: styles.headerRow },
        el(Image, { src: LOGO_PATH, style: styles.logo }),
        el(View, { style: styles.headerText },
          el(Text, { style: styles.brandName }, restaurantName),
          el(Text, { style: styles.subtitle }, "Vietnamese Cuisine"),
        ),
      ),
      el(View, { style: styles.divider }),
      el(View, { style: styles.contactBar },
        el(Text, { style: styles.contactText },
          address + (cityZip ? `, ${cityZip}` : ""),
        ),
        el(Text, { style: styles.contactText }, phone),
      ),
      el(View, { style: styles.hoursSection },
        el(Text, { style: styles.hoursTitle }, "Hours"),
        el(View, { style: styles.hoursGrid }, ...hoursEntries),
      ),
      el(View, { style: styles.divider }),
      ...categoryElements,
      el(Text, { style: styles.pageFooter, fixed: true },
        `Menu prices subject to change. Generated ${generatedDate}.`,
      ),
    ),
  );
}

export async function generateMenuPdf() {
  const data = await fetchPdfData();
  const document = buildDocument(data);
  return await renderToBuffer(document);
}
