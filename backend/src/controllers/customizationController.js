// src/controllers/customizationController.js
import { pool } from "../db/connect_db.js";

// ── GET /api/menu/customizations — public ─────────────────────────────────────
export async function getAllCustomizations(req, res) {
  try {
    const [groups] = await pool.query(
      "SELECT id, category_id, enabled FROM category_customization_groups",
    );

    if (!groups.length) return res.json({ customizations: {} });

    const groupIds = groups.map((g) => g.id);

    const [sections] = await pool.query(
      `SELECT id, group_id, title, position
       FROM customization_sections
       WHERE group_id IN (?)
       ORDER BY group_id, position, id`,
      [groupIds],
    );

    let items = [];
    const sectionIds = sections.map((s) => s.id);
    if (sectionIds.length) {
      [items] = await pool.query(
        `SELECT id, section_id, name, price, position
         FROM customization_items
         WHERE section_id IN (?)
         ORDER BY section_id, position, id`,
        [sectionIds],
      );
    }

    const customizations = {};
    for (const group of groups) {
      const groupSections = sections
        .filter((s) => s.group_id === group.id)
        .map((s) => ({
          id: s.id,
          title: s.title,
          items: items
            .filter((i) => i.section_id === s.id)
            .map((i) => ({ id: i.id, name: i.name, price: i.price })),
        }));

      customizations[String(group.category_id)] = {
        enabled: Boolean(group.enabled),
        sections: groupSections,
      };
    }

    res.json({ customizations });
  } catch (err) {
    console.error("getAllCustomizations error:", err);
    res.status(500).json({ error: "Failed to fetch customizations" });
  }
}

// ── PUT /api/menu/categories/:id/customization — admin, full upsert ───────────
export async function upsertCustomization(req, res) {
  const categoryId = Number(req.params.id);
  const { enabled = true, sections = [] } = req.body || {};

  if (!Array.isArray(sections) || sections.length > 7) {
    return res.status(400).json({ error: "Sections must be an array of at most 7" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Upsert the group row
    const [existing] = await conn.query(
      "SELECT id FROM category_customization_groups WHERE category_id = ?",
      [categoryId],
    );

    let groupId;
    if (existing.length) {
      groupId = existing[0].id;
      await conn.query(
        "UPDATE category_customization_groups SET enabled = ? WHERE id = ?",
        [enabled ? 1 : 0, groupId],
      );
      // Cascade deletes sections → items automatically
      await conn.query(
        "DELETE FROM customization_sections WHERE group_id = ?",
        [groupId],
      );
    } else {
      const [result] = await conn.query(
        "INSERT INTO category_customization_groups (category_id, enabled) VALUES (?, ?)",
        [categoryId, enabled ? 1 : 0],
      );
      groupId = result.insertId;
    }

    // Re-insert sections and items
    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      if (!sec.title?.trim()) continue;

      const [secResult] = await conn.query(
        "INSERT INTO customization_sections (group_id, title, position) VALUES (?, ?, ?)",
        [groupId, sec.title.trim(), si],
      );
      const sectionId = secResult.insertId;

      if (Array.isArray(sec.items)) {
        for (let ii = 0; ii < sec.items.length; ii++) {
          const item = sec.items[ii];
          if (!item.name?.trim()) continue;
          await conn.query(
            "INSERT INTO customization_items (section_id, name, price, position) VALUES (?, ?, ?, ?)",
            [sectionId, item.name.trim(), item.price?.trim() || null, ii],
          );
        }
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("upsertCustomization error:", err);
    res.status(500).json({ error: "Failed to save customization" });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/menu/categories/:id/customization — admin ─────────────────────
export async function deleteCustomization(req, res) {
  const categoryId = Number(req.params.id);
  try {
    await pool.query(
      "DELETE FROM category_customization_groups WHERE category_id = ?",
      [categoryId],
    );
    res.status(204).send();
  } catch (err) {
    console.error("deleteCustomization error:", err);
    res.status(500).json({ error: "Failed to delete customization" });
  }
}
