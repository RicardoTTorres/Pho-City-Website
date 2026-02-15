// src/controllers/adminContactController.js
import { pool } from '../db/connect_db.js';
import { logActivity } from './activityController.js';

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
      address: c.contact_address,
      city: c.contact_city,
      state: c.contact_state,
      zipcode: c.contact_zipcode,
      fullAddress: `${c.contact_address}, ${c.contact_city}, ${c.contact_state} ${c.contact_zipcode}`,
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

export async function updateContactInfo(req, res) {
  const {
    phone,
    email,
    address,
    city,
    state,
    zipcode,
    businessHours
  } = req.body;

  if (
    !phone || !email || !address ||
    !city || !state || !zipcode ||
    !Array.isArray(businessHours)
  ) {
    return res.status(400).json({
      error: 'All contact fields are required.'
    });
  }

  try {
    await pool.query(
      `
      UPDATE contact_info
      SET
        contact_phone = ?,
        contact_email = ?,
        contact_address = ?,
        contact_city = ?,
        contact_state = ?,
        contact_zipcode = ?
      LIMIT 1
      `,
      [phone, email, address, city, state, zipcode]
    );

    for (const h of businessHours) {
      await pool.query(
        `
        UPDATE operating_hours
        SET
          open_time = ?,
          close_time = ?,
          restaurant_is_closed = ?
        WHERE day_of_week = ?
        `,
        [
          h.closed ? null : h.open,
          h.closed ? null : h.close,
          h.closed ? 1 : 0,
          h.day
        ]
      );
    }

    logActivity("updated", "contact", "Updated contact info & hours", req.user?.email);
    res.status(200).json({
      message: 'Contact information updated successfully.'
    });
  } catch (err) {
    console.error('Error updating contact info:', err);
    res.status(500).json({
      error: 'Failed to update contact info'
    });
  }
}

