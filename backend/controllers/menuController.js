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