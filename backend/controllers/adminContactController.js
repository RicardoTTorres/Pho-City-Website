import { pool } from '../db/connect_db.js';

export async function getContactInfo(req, res) {
  try {
    const [contactRows] = await pool.query(`
      SELECT
        contact_phone,
        contact_email,
        contact_address,
        contact_city,
        contact_state,
        contact_zipcode
      FROM contact_info
      LIMIT 1
    `);

    const [hoursRows] = await pool.query(`
      SELECT
        day_of_week,
        open_time,
        close_time,
        restaurant_is_closed
      FROM operating_hours
      ORDER BY oh_id
    `);

    const c = contactRows[0];

    res.status(200).json({
      phone: c.contact_phone,
      email: c.contact_email,
      address: `${c.contact_address}, ${c.contact_city}, ${c.contact_state} ${c.contact_zipcode}`,
      businessHours: hoursRows.map(h => ({
        day: h.day_of_week,
        open: h.restaurant_is_closed ? null : h.open_time,
        close: h.restaurant_is_closed ? null : h.close_time,
        closed: Boolean(h.restaurant_is_closed)
      }))
    });
  } catch (err) {
    console.error('Error loading contact info:', err);
    res.status(500).json({ error: 'Failed to load contact info' });
  }
}


// updateContactInfo

// export function updateContactInfo(req, res) {
//   const newData = req.body;
//   contactInfo = { ...contactInfo, ...newData };
//   res.json({ message: "Contact info updated successfully", contactInfo });
// }
