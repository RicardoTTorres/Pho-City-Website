import { pool } from "../db/connect_db.js";

export async function getMenu(req, res) {
  try {
    // Fetch all categories
    const [categories] = await pool.query(`
      SELECT category_id AS id, category_name AS name
      FROM menu_categories
      ORDER BY id;
    `);

    // Fetch menu items
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
      ORDER BY category_id, id;
    `);

    // Shape data for frontend
    const formatted = categories.map(cat => ({
      id: String(cat.id),
      name: cat.name,
      items: items
        .filter(i => i.category_id === cat.id)
        .map(i => ({
          id: String(i.id),
          name: i.name,
          description: i.description,
          price: `$${Number(i.price).toFixed(2)}`,
          image: i.image ? `/imgs/${i.image}` : null
        }))
    }));

    res.json({ menu: { categories: formatted } });

  } catch (err) {
    console.error("Menu fetch error:", err);
    res.status(500).json({ error: "Error fetching menu" });
  }
}

export async function addCategory(req, res) {
  try {
    const {name} = req.body;

    // ensure necessary values are included
    if (name === undefined) {
      res.status(400).json({ error: "Missing required properties" });
      return;
    }

    // execute query
    const [result] = await pool.query(`
      INSERT INTO menu_categories (category_name)
      VALUES (?);
    `, [name]);

    // respond with new category id
    if (result.insertId === undefined) throw new Error("MySQL insert statement did not include id");
    res.status(201).json({ id: String(result.insertId) });

  } catch (err) {
    console.error("Error in menu/addCategory:", err);
    res.status(500).json({ error: "Error adding category" });
  }
}

export async function editCategory(req, res) {
  try {
    const id = req.params.id;
    if (id === undefined) throw new Error("Could not get id from url parameters");
    const {name} = req.body;

    if (name === undefined) {
      res.status(400).json({ error: "Missing properties to edit" });
      return;
    }

    const [result] = await pool.query(`
      UPDATE menu_categories
      SET category_name = ?
      WHERE category_id = ?;
    `, [name, id]);

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

    res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Error in menu/editCategory:", err);
    res.status(500).json({ error: "Error editing category" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const id = req.params.id;
    if (id === undefined) throw new Error("Could not get id from url parameters");

    const [result] = await pool.query(`
      DELETE FROM menu_categories
      WHERE category_id = ?;
    `, [id]);

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

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
      category: category_id
    } = req.body;

    // ensure necessary keys are included. keys with a default value are not necessary
    if ([item_name, item_price, category_id].includes(undefined)) {
        res.status(400).json({ error: "Missing required properties" });
        return;
    }

    // remove undefined keys so query will not attempt to set their values to undefined
    const entries = removeUndefined({item_name, item_description, item_price, item_image_url, item_is_visible, is_featured, category_id});
    const keys = Object.keys(entries);
    const values = Object.values(entries);

    // execute the query
    // only keys are embedded into sql statement, values are still handled using "?" format for security
    const [result] = await pool.query(`
      INSERT INTO menu_items (${keys.join(', ')})
      VALUES (${keys.map(() => '?').join(', ')});
    `, values);

    // respond with new item id
    if (result.insertId === undefined) throw new Error("MySQL insert statement did not include id");
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
    if (id === undefined) throw new Error("Could not get id from url parameters");

    // get values from req.body, rename to match db column names
    const {
      name: item_name,
      description: item_description,
      price: item_price,
      image: item_image_url,
      visible: item_is_visible,
      featured: is_featured,
      category: category_id
    } = req.body;

    // remove undefined keys so query will only edit provided keys
    const entries = removeUndefined({item_name, item_description, item_price, item_image_url, item_is_visible, is_featured, category_id});
    const keys = Object.keys(entries);
    const values = Object.values(entries);

    // ensure request did provide keys to edit
    if (keys.length == 0) {
      res.status(400).json({ error: "Missing properties to edit" });
      return;
    }

    // execute the query
    // only keys are embedded into sql statement, values are still handled using "?" format for security
    const [result] = await pool.query(`
      UPDATE menu_items
      SET ${keys.map(key => `${key} = ?`).join(', ')}
      WHERE item_id = ?;
    `, [...values, id]);

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

    res.status(200).json({ ok: true });
    
  } catch (err) {
    console.error("Error in menu/editItem:", err);
    res.status(500).json({ error: "Error editing item" });
  }
}

export async function deleteItem(req, res) {
  try {
    const id = req.params.id;
    if (id === undefined) throw new Error("Could not get id from url parameters");

    const [result] = await pool.query(`
      DELETE FROM menu_items
      WHERE item_id = ?;
    `, [id]);

    if (result.affectedRows < 1) {
      res.status(404).json({ error: `No rows in database matching id ${id}` });
      return;
    }

    res.status(204).send();

  } catch (err) {
    console.error("Error in menu/deleteItem:", err);
    res.status(500).json({ error: "Error deleting item" });
  }
}

// helper function to filter javascript object and only keep keys whose values are not undefined
function removeUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([key, value]) => value !== undefined
    )
  );
}