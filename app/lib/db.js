import mysql from "mysql2/promise";

const isProduction = process.env.NODE_ENV === "production";
const databaseConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || (isProduction ? undefined : "127.0.0.1"),
  user: process.env.DB_USER || process.env.MYSQLUSER || (isProduction ? undefined : "root"),
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || (isProduction ? undefined : ""),
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "spmb",
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
};

const missingConfig = Object.entries(databaseConfig)
  .filter(([key, value]) => isProduction && key !== "port" && !value)
  .map(([key]) => key);

const pool = missingConfig.length ? null : mysql.createPool(databaseConfig);

function getPool() {
  if (!pool) {
    throw new Error(`Konfigurasi database production belum lengkap: ${missingConfig.join(", ")}.`);
  }
  return pool;
}

const db = {
  query(...args) {
    return getPool().query(...args);
  },
  execute(...args) {
    return getPool().execute(...args);
  },
  getConnection(...args) {
    return getPool().getConnection(...args);
  },
};

export default db;