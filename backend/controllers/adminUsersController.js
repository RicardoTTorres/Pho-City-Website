import { pool } from "../db/connect_db.js";

export async function getAdminUsers(req, res) {
    const [[adminUsers]] = await pool.query(`
        SELECT * FROM ADMIN_USERS;
        `);
    res.json({
        adminUsers: {
            email: adminUsers.email,
            password: adminUsers.password
        }
    });
}