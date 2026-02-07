import { pool } from "../db/connect_db.js";

function isString(value) {
  return typeof value === "string";
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isFooterPayload(body) {
  if (!body || typeof body !== "object") return false;

  const { brand, navLinks, instagram, contact } = body;

  if (!brand || !isString(brand.name) || !isString(brand.logo)) return false;
  if (!instagram || !isString(instagram.url) || !isString(instagram.icon)) return false;
  if (!contact || !isString(contact.address) || !isString(contact.cityZip) || !isString(contact.phone)) return false;
  if (!Array.isArray(navLinks)) return false;

  for (const link of navLinks) {
    if (!link || typeof link !== "object") return false;
    if (!isString(link.label) || !isString(link.path)) return false;
    if (!isBoolean(link.external) || !isBoolean(link.visible)) return false;
  }

  return true;
}

export async function getFooter(req, res) {
  try {
    const [[section]] = await pool.query(
      `SELECT
        brand_name,
        brand_logo,
        instagram_url,
        instagram_icon,
        contact_address,
        contact_city_zip,
        contact_phone
       FROM footer_section
       WHERE footer_id = 1`
    );

    const [links] = await pool.query(
      `SELECT label, path, external, visible
       FROM footer_links
       WHERE footer_id = 1
       ORDER BY sort_order ASC, id ASC`
    );

    const footer = {
      brand: {
        name: section?.brand_name ?? "",
        logo: section?.brand_logo ?? "",
      },
      navLinks: links.map((link) => ({
        label: link.label ?? "",
        path: link.path ?? "",
        external: Boolean(link.external),
        visible: Boolean(link.visible),
      })),
      instagram: {
        url: section?.instagram_url ?? "",
        icon: section?.instagram_icon ?? "",
      },
      contact: {
        address: section?.contact_address ?? "",
        cityZip: section?.contact_city_zip ?? "",
        phone: section?.contact_phone ?? "",
      },
    };

    res.json({ footer });
  } catch (err) {
    console.error("Error fetching footer:", err);
    res.status(500).json({ error: "Error fetching footer" });
  }
}

export async function updateFooter(req, res) {
  try {
    if (!isFooterPayload(req.body)) {
      return res.status(400).json({ error: "Invalid footer payload" });
    }

    const { brand, navLinks, instagram, contact } = req.body;

    await pool.query(
      `UPDATE footer_section
       SET brand_name = ?,
           brand_logo = ?,
           instagram_url = ?,
           instagram_icon = ?,
           contact_address = ?,
           contact_city_zip = ?,
           contact_phone = ?
       WHERE footer_id = 1`,
      [
        brand.name,
        brand.logo,
        instagram.url,
        instagram.icon,
        contact.address,
        contact.cityZip,
        contact.phone,
      ]
    );

    await pool.query(
      `DELETE FROM footer_links
       WHERE footer_id = 1`
    );

    if (navLinks.length > 0) {
      const values = navLinks.map((link, index) => [
        1,
        link.label,
        link.path,
        link.external ? 1 : 0,
        link.visible ? 1 : 0,
        index,
      ]);

      await pool.query(
        `INSERT INTO footer_links
         (footer_id, label, path, external, visible, sort_order)
         VALUES ?`,
        [values]
      );
    }

    res.json({ message: "Footer updated successfully" });
  } catch (err) {
    console.error("Error updating footer:", err);
    res.status(500).json({ error: "Error updating footer" });
  }
}
