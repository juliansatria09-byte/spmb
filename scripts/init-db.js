const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE || 'spmb';
  const config = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || (isProduction ? undefined : '127.0.0.1'),
    user: process.env.DB_USER || process.env.MYSQLUSER || (isProduction ? undefined : 'root'),
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || (isProduction ? undefined : ''),
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    multipleStatements: true,
  };
  const missingConfig = Object.entries(config)
    .filter(([key, value]) => isProduction && key !== 'port' && key !== 'multipleStatements' && !value)
    .map(([key]) => key);

  if (missingConfig.length) {
    throw new Error(`Konfigurasi database production belum lengkap: ${missingConfig.join(', ')}.`);
  }

  const connection = await mysql.createConnection({
    ...config,
    ...(isProduction ? { database } : {}),
  });

  try {
    if (!isProduction) {
      const escapedDatabase = database.replace(/`/g, '``');
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${escapedDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.query(`USE \`${escapedDatabase}\`;`);
    }

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);

    if (isProduction) {
      await connection.query(
        `INSERT INTO roles (name, slug) VALUES
          ('Pelajar', 'pelajar'),
          ('Admin SPMB', 'admin'),
          ('Kepala Sekolah', 'kepala')
        ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug)`,
      );
      await connection.query(
        `INSERT INTO programs (name, description, capacity, is_active) VALUES
          ('Rekayasa Perangkat Lunak', 'Program keahlian rekayasa perangkat lunak', 0, 1),
          ('Desain Komunikasi Visual', 'Program keahlian desain komunikasi visual', 0, 1),
          ('Manajemen Perkantoran', 'Program keahlian manajemen perkantoran', 0, 1),
          ('Kuliner', 'Program keahlian kuliner', 0, 1)
        ON DUPLICATE KEY UPDATE description = VALUES(description), is_active = 1`,
      );
      console.log(`Schema database ${database} berhasil disiapkan.`);
    } else {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log(`Database ${database} berhasil dibuat dan di-seed.`);
    }
  } finally {
    await connection.end();
  }
}

initDatabase().catch((error) => {
  console.error('Gagal membuat database:', error.message);
  process.exit(1);
});
