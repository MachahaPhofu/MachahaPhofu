const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for frontend connection
app.use(express.json()); // Parse JSON request bodies

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',    // Your MySQL host
  user: 'root',         // Your MySQL username
  password: 'Pm58568822.com',  // Your MySQL password
  database: 'wings_inventory'  // Your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL as ID', db.threadId);
});

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Route to get all products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.status(200).json(results); // Send retrieved data as JSON
  });
});

// Route to add a new product
app.post('/api/products', (req, res) => {
  const { name, description, category, price, quantity } = req.body;

  if (!name || !category || !price || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [name, description, category, price, quantity], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  });
});

// Route to delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM products WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  });
});

// Route to update a product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;

  if (!name || !category || !price || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `UPDATE products SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?`;
  db.query(query, [name, description, category, price, quantity, id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully' });
  });
});

// Route to adjust stock (add stock)
app.post('/api/products/:id/add-stock', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ error: 'Invalid stock quantity' });
  }

  db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    const product = results[0];
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newQuantity = product.quantity + quantity;
    const updateQuery = 'UPDATE products SET quantity = ? WHERE id = ?';
    db.query(updateQuery, [newQuantity, id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating product stock:', updateErr);
        return res.status(500).json({ error: 'Error updating product stock' });
      }
      res.status(200).json({ message: `Stock added successfully, new quantity: ${newQuantity}` });
    });
  });
});

// Route to adjust stock (deduct stock)
app.post('/api/products/:id/deduct-stock', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ error: 'Invalid stock quantity' });
  }

  db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    const product = results[0];
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock to deduct' });
    }

    const newQuantity = product.quantity - quantity;
    const updateQuery = 'UPDATE products SET quantity = ? WHERE id = ?';
    db.query(updateQuery, [newQuantity, id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating product stock:', updateErr);
        return res.status(500).json({ error: 'Error updating product stock' });
      }
      res.status(200).json({ message: `Stock deducted successfully, new quantity: ${newQuantity}` });
    });
  });
});

// Catch-all route for non-existing routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', method: req.method, url: req.originalUrl });
});

// Start Server
const PORT = process.env.PORT || 5009;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
