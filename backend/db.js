const mysql = require("mysql2/promise");

// Create a connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,        // your MySQL username
  password: process.env.DB_PASSWORD,        // your MySQL password
  database: process.env.DB_NAME,  // database name,
    waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Connect to MySQL
// connection.connect((err) => {
//   if (err) {
//     console.log("❌ MySQL Connection Failed:", err);
//   } else {
//     console.log("✅ Connected to MySQL Database!");
//   }
// });

module.exports = db;

// for start project
// nodemon index.js
