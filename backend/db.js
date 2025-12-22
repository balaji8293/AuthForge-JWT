const mysql = require("mysql2/promise");

const db = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 10000
});

module.exports = db;
