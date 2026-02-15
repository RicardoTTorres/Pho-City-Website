// src/db/connect_db.js
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  })
  .promise();
