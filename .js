const mysql = require('mysql2');  // Use 'mysql2' instead of 'mysql'

const db = mysql.createConnection({
  host: 'localhost',      // Your MySQL host
  user: 'root',  // Your MySQL username
  password: 'Pm58568822.com',  // Your MySQL password
  database: 'inventory_db'  // Your MySQL database
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;
