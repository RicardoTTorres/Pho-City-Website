// src/controllers/menuController.js
import { pool } from "../db/connect_db.js";
import { logActivity } from "./activityController.js";

export async function getMenu(req, res) {
  try {
    // Fetch all categories (ordered by position)
    const [categories] = await pool.query(`
      SELECT category_id AS id, category_name AS name
      FROM menu_categories
      ORDER BY position ASC, category_id ASC;
    `);

    // Fetch visible menu items (ordered by position within category)
    const [items] = await pool.query(`
      SELECT 
        item_id AS id,
        item_name AS name,
        item_description AS description,
        item_price AS price,
        item_image_url AS image,
        item_is_visible AS visible,
        category_id
      FROM menu_items
      WHERE item_is_visible = 1
      ORDER BY category_id ASC, position ASC, item_id ASC;
    `);

    // Shape data for frontend
    const formatted = categories.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      items: items
        .filter((i) => i.category_id === cat.id)
        .map((i) => ({
          id: String(i.id),
          name: i.name,
          description: i.description,
          price: `$${Number(i.price).toFixed(2)}`,
          image: i.image ? `/imgs/${i.image}` : null,
        })),
    }));

    res.json({ menu: { categories: formatted } });
  } catch (err) {
    console.error("Menu fetch error:", err);
    res.status(500).json({ error: "Error fetching menu" });
  }
}

export async function getAdminMenu(req, res) {
  try {
    // Fetch all categories (ordered by position)
    const [categories] = await pool.query(`
      SELECT category_id AS id, category_name AS name
      FROM menu_categories
      ORDER BY position ASC, category_id ASC;
    `);

    // Fetch ALL menu items (including hidden ones for admin) ordered by position
    const [items] = await pool.query(`
      SELECT 
        item_id AS id,
        item_name AS name,
        item_description AS description,
        item_price AS price,
        item_image_url AS image,
        item_is_visible AS visible,
        is_featured AS featured,
        featured_position AS featuredPosition,
        category_id
      FROM menu_items
      ORDER BY category_id ASC, position ASC, item_id ASC;
    `);

    // Shape data for admin frontend
    const formatted = categories.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      items: items
        .filter((i) => i.category_id === cat.id)
        .map((i) => ({
          id: String(i.id),
          name: i.name,
          description: i.description,
          price: Number(i.price),
          image: i.image,
          visible: Boolean(i.visible),
          featured: Boolean(i.featured),
          featuredPosition: i.featuredPosition ?? null,
          categoryId: i.category_id,
        })),
    }));

    res.json({ menu: { categories: formatted } });
  } catch (err) {
    console.error("Admin menu fetch error:", err);
    res.status(500).json({ error: "Error fetching admin menu" });
  }
}

export async function addCategory(req, res) {
  try {
    const { name } = req.body;

    // ensure necessary values are included
    if (name === undefined) {
      res.status(400).json({ error: "Missing required properties" });
      return;
    }

    // Put new category at the end by default
    const [[maxRow]] = await pool.query(`
      SELECT COALESCE(MAX(position), -1) AS maxPos
      FROM menu_categories;
    `);
    const nextPos = Number(maxRow.maxPos) + 1;

    // execute query
    const [result] = await pool.query(
      `
      INSERT INTO menu_categories (category_name, position)
      VALUES (?, ?);
    `,
      [name, nextPos],
    );

    // respond with new category id
    if (result.insertId === undefined)
      throw new Error("MySQL insert statement did not include id");
    logActivity(
      "created",
      "menu_category",
      `Created category '${name}'`,
      req.user?.email,
    );
    res.status(201).json({ id: String(result.insertId) });
  } catch (err) {
    console.error("Error in menu/addCategory:", err);
    res.status(500).json({ error: "Error adding category" });
  }
}

export async function editCategory(req, res) {
  try {
    const id = req.params.id;
    if (id === undefined)
      throw new Error("Could not get id from url parameters");
    const { name } = req.body;

    if (name === undefined) {
      res.status(400).json({ error: "Missing properties to edit" });
      return;
    }

    const [result] = await pool.query(
      `
      UPDATE menu_categories
      SET category_name = ?
      WHERE category_id = ?;
    `,
      [name, id],
    );

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

    logActivity(
      "updated",
      "menu_category",
      `Renamed category to '${name}'`,
      req.user?.email,
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in menu/editCategory:", err);
    res.status(500).json({ error: "Error editing category" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const id = req.params.id;
    if (id === undefined)
      throw new Error("Could not get id from url parameters");

    const [result] = await pool.query(
      `
      DELETE FROM menu_categories
      WHERE category_id = ?;
    `,
      [id],
    );

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

    logActivity(
      "deleted",
      "menu_category",
      `Deleted a menu category`,
      req.user?.email,
    );
    res.status(204).send();
  } catch (err) {
    console.error("Error in menu/deleteCategory:", err);
    res.status(500).json({ error: "Error deleting category" });
  }
}

export async function addItem(req, res) {
  try {
    // get values from req.body, rename to match db column names
    const {
      name: item_name,
      description: item_description,
      price: item_price,
      image: item_image_url,
      visible: item_is_visible,
      featured: is_featured,
      featuredPosition: featured_position,
      category: category_id,
    } = req.body;

    // ensure necessary keys are included. keys with a default value are not necessary
    if ([item_name, item_price, category_id].includes(undefined)) {
      res.status(400).json({ error: "Missing required properties" });
      return;
    }

    // Put new item at the end of its category by default
    const [[maxRow]] = await pool.query(
      `
      SELECT COALESCE(MAX(position), -1) AS maxPos
      FROM menu_items
      WHERE category_id = ?;
    `,
      [category_id],
    );
    const nextPos = Number(maxRow.maxPos) + 1;

    // Clear featured_position when not featured
    const resolvedFeaturedPosition = is_featured ? featured_position : null;

    // remove undefined keys so query will not attempt to set their values to undefined
    const entries = removeUndefined({
      item_name,
      item_description,
      item_price,
      item_image_url,
      item_is_visible,
      is_featured,
      featured_position: resolvedFeaturedPosition,
      category_id,
      position: nextPos,
    });
    const keys = Object.keys(entries);
    const values = Object.values(entries);

    // execute the query
    const [result] = await pool.query(
      `
      INSERT INTO menu_items (${keys.join(", ")})
      VALUES (${keys.map(() => "?").join(", ")});
    `,
      values,
    );

    // respond with new item id
    if (result.insertId === undefined)
      throw new Error("MySQL insert statement did not include id");
    logActivity(
      "created",
      "menu_item",
      `Added menu item '${item_name}'`,
      req.user?.email,
    );
    res.status(201).json({ id: String(result.insertId) });
  } catch (err) {
    console.error("Error in menu/addItem:", err);
    res.status(500).json({ error: "Error adding item" });
  }
}

export async function editItem(req, res) {
  try {
    // get id
    const id = req.params.id;
    if (id === undefined)
      throw new Error("Could not get id from url parameters");

    // get values from req.body, rename to match db column names
    const {
      name: item_name,
      description: item_description,
      price: item_price,
      image: item_image_url,
      visible: item_is_visible,
      featured: is_featured,
      featuredPosition: featured_position,
      category: category_id,
    } = req.body;

    // Clear featured_position when unfeaturing an item
    const resolvedFeaturedPosition =
      is_featured === false || is_featured === 0 ? null : featured_position;

    // remove undefined keys so query will only edit provided keys
    const entries = removeUndefined({
      item_name,
      item_description,
      item_price,
      item_image_url,
      item_is_visible,
      is_featured,
      featured_position: resolvedFeaturedPosition,
      category_id,
    });
    const keys = Object.keys(entries);
    const values = Object.values(entries);

    // ensure request did provide keys to edit
    if (keys.length == 0) {
      res.status(400).json({ error: "Missing properties to edit" });
      return;
    }

    // execute the query
    const [result] = await pool.query(
      `
      UPDATE menu_items
      SET ${keys.map((key) => `${key} = ?`).join(", ")}
      WHERE item_id = ?;
    `,
      [...values, id],
    );

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

    logActivity(
      "updated",
      "menu_item",
      `Updated menu item #${id}`,
      req.user?.email,
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in menu/editItem:", err);
    res.status(500).json({ error: "Error editing item" });
  }
}

export async function deleteItem(req, res) {
  try {
    const id = req.params.id;
    if (id === undefined)
      throw new Error("Could not get id from url parameters");

    const [result] = await pool.query(
      `
      DELETE FROM menu_items
      WHERE item_id = ?;
    `,
      [id],
    );

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

    logActivity(
      "deleted",
      "menu_item",
      `Deleted menu item #${id}`,
      req.user?.email,
    );
    res.status(204).send();
  } catch (err) {
    console.error("Error in menu/deleteItem:", err);
    res.status(500).json({ error: "Error deleting item" });
  }
}

export async function reorderCategories(req, res) {
  const { categoryIds } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return res
      .status(400)
      .json({ error: "categoryIds must be a non-empty array" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validate categories exist
    const [existing] = await conn.query(
      "SELECT category_id FROM menu_categories WHERE category_id IN (?)",
      [categoryIds],
    );

    if (existing.length !== categoryIds.length) {
      await conn.rollback();
      return res
        .status(400)
        .json({ error: "One or more categoryIds do not exist" });
    }

    const [[maxRow]] = await conn.query(
      `
      SELECT COALESCE(MAX(position), -1) AS maxPos
      FROM menu_categories
      `,
    );
    const tempBase = Number(maxRow.maxPos) + categoryIds.length + 1;

    const tempCaseSql = categoryIds
      .map(
        (id, idx) => `WHEN ${conn.escape(Number(id))} THEN ${tempBase + idx}`,
      )
      .join(" ");

    await conn.query(
      `
      UPDATE menu_categories
      SET position = CASE category_id
        ${tempCaseSql}
        ELSE position
      END
      WHERE category_id IN (?)
      `,
      [categoryIds],
    );

    const finalCaseSql = categoryIds
      .map((id, idx) => `WHEN ${conn.escape(Number(id))} THEN ${idx}`)
      .join(" ");

    await conn.query(
      `
      UPDATE menu_categories
      SET position = CASE category_id
        ${finalCaseSql}
        ELSE position
      END
      WHERE category_id IN (?)
      `,
      [categoryIds],
    );

    await conn.commit();
    logActivity(
      "updated",
      "menu_category",
      "Reordered menu categories",
      req.user?.email,
    );
    return res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("reorderCategories error:", err);
    return res.status(500).json({ error: "Failed to reorder categories" });
  } finally {
    conn.release();
  }
}

export async function reorderCategoryItems(req, res) {
  const { categoryId } = req.params;
  const { itemIds } = req.body;

  if (!categoryId) {
    return res.status(400).json({ error: "categoryId is required" });
  }
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: "itemIds must be a non-empty array" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      `
      SELECT item_id
      FROM menu_items
      WHERE category_id = ? AND item_id IN (?)
      `,
      [Number(categoryId), itemIds],
    );

    if (existing.length !== itemIds.length) {
      await conn.rollback();
      return res.status(400).json({
        error:
          "One or more itemIds do not exist or do not belong to this category",
      });
    }

    const [[maxRow]] = await conn.query(
      `
      SELECT COALESCE(MAX(position), -1) AS maxPos
      FROM menu_items
      WHERE category_id = ?
      `,
      [Number(categoryId)],
    );
    const tempBase = Number(maxRow.maxPos) + itemIds.length + 1;

    const tempCaseSql = itemIds
      .map(
        (id, idx) => `WHEN ${conn.escape(Number(id))} THEN ${tempBase + idx}`,
      )
      .join(" ");

    await conn.query(
      `
      UPDATE menu_items
      SET position = CASE item_id
        ${tempCaseSql}
        ELSE position
      END
      WHERE category_id = ? AND item_id IN (?)
      `,
      [Number(categoryId), itemIds],
    );

    const finalCaseSql = itemIds
      .map((id, idx) => `WHEN ${conn.escape(Number(id))} THEN ${idx}`)
      .join(" ");

    await conn.query(
      `
      UPDATE menu_items
      SET position = CASE item_id
        ${finalCaseSql}
        ELSE position
      END
      WHERE category_id = ? AND item_id IN (?)
      `,
      [Number(categoryId), itemIds],
    );

    await conn.commit();
    logActivity(
      "updated",
      "menu_item",
      "Reordered items in a category",
      req.user?.email,
    );
    return res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("reorderCategoryItems error:", err);
    return res.status(500).json({ error: "Failed to reorder items" });
  } finally {
    conn.release();
  }
}

export async function getFeaturedItems(req, res) {
  try {
    const [items] = await pool.query(`
      SELECT
        item_id AS id,
        item_name AS name,
        item_description AS description,
        item_price AS price,
        item_image_url AS image,
        featured_position AS featuredPosition
      FROM menu_items
      WHERE is_featured = 1 AND item_is_visible = 1
      ORDER BY featured_position ASC
      LIMIT 4;
    `);

    const formatted = items.map((i) => ({
      id: String(i.id),
      name: i.name,
      description: i.description,
      price: `$${Number(i.price).toFixed(2)}`,
      image: i.image ? `/imgs/${i.image}` : null,
      featuredPosition: i.featuredPosition,
    }));

    res.json({ items: formatted });
  } catch (err) {
    console.error("Featured items fetch error:", err);
    res.status(500).json({ error: "Error fetching featured items" });
  }
}

function removeUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([key, value]) => value !== undefined),
  );
}
