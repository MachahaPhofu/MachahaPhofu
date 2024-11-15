// server.js
const express = require('express');
const db = require('./db'); // Import the database connection
const app = express();
const PORT = 5003;

// Middleware to parse JSON requests
app.use(express.json());

// Example API endpoint to get data
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM your_table';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
