import React, { useState, useEffect } from "react";
import axios from "axios";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    quantity: 0,
    editingId: null,
  });
  const [adjustStock, setAdjustStock] = useState(0);

  // Fetch products from the database
  const fetchProducts = () => {
    axios
      .get("http://localhost:5009/api/products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  // Handle stock adjustment input changes
  const handleStockChange = (e) => {
    setAdjustStock(Number(e.target.value));
  };

  // Reset form
  const resetForm = () => {
    setProduct({
      name: "",
      description: "",
      category: "",
      price: 0,
      quantity: 0,
      editingId: null,
    });
    setAdjustStock(0);
  };

  // Add or update product
  const handleUpdateProduct = () => {
    if (product.name && product.description && product.category && product.price > 0 && product.quantity >= 0) {
      if (product.editingId) {
        // Update existing product
        axios
          .put(`http://localhost:5009/api/products/${product.editingId}`, product)
          .then((response) => {
            setProducts((prevProducts) =>
              prevProducts.map((item) => (item.id === product.editingId ? response.data : item))
            );
            alert("Product updated successfully!");
            resetForm();
          })
          .catch((error) => {
            console.error("Error updating product:", error);
            alert("Error updating product");
          });
      } else {
        // Add new product
        axios
          .post("http://localhost:5009/api/products", product)
          .then((response) => {
            setProducts((prevProducts) => [...prevProducts, { ...product, id: response.data.productId }]);
            alert("Product added successfully!");
            resetForm();
          })
          .catch((error) => {
            console.error("Error adding product:", error);
            alert("Error adding product");
          });
      }
    } else {
      alert("Please fill in all fields correctly!");
    }
  };

  // Delete product
  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`http://localhost:5009/api/products/${id}`)
        .then(() => {
          setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
          alert("Product deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          alert("Error deleting product");
        });
    }
  };

  // Adjust stock
  const handleAdjustStock = (id, operation) => {
    if (adjustStock <= 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    const endpoint = operation === "add" ? "add-stock" : "deduct-stock";

    axios
      .post(`http://localhost:5009/api/products/${id}/${endpoint}`, { quantity: adjustStock })
      .then((response) => {
        setProducts((prevProducts) =>
          prevProducts.map((product) => (product.id === id ? response.data : product))
        );
        alert(`Stock ${operation === "add" ? "added" : "deducted"} successfully!`);
        setAdjustStock(0);
      })
      .catch((error) => {
        console.error(`Error adjusting stock: ${error}`);
        alert(`Error adjusting stock: ${error.response?.data?.message || "Unknown error"}`);
      });
  };

  return (
    <div>
      <h2>Product Management</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleInputChange}
          placeholder="Product Name"
          required
          className="input-large" // Added class for input styling
        />
        <input
          type="text"
          name="description"
          value={product.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
          className="input-large" // Added class for input styling
        />
        <input
          type="text"
          name="category"
          value={product.category}
          onChange={handleInputChange}
          placeholder="Category"
          required
          className="input-large" // Added class for input styling
        />
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleInputChange}
          placeholder="Price"
          min="0"
          required
          className="input-large" // Added class for input styling
        />
        <input
          type="number"
          name="quantity"
          value={product.quantity}
          onChange={handleInputChange}
          placeholder="Quantity"
          min="0"
          required
          className="input-large" // Added class for input styling
        />
        <button onClick={handleUpdateProduct}>
          {product.editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h3>Product List</h3>
      <table border="1" cellPadding="5" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No products available.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.quantity}</td>
                <td>
                  <button onClick={() => setProduct({ ...product, editingId: product.id })}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                  <input
                    type="number"
                    min="1"
                    value={adjustStock}
                    onChange={handleStockChange}
                    placeholder="Qty"
                    style={{ width: "60px" }}
                  />
                  <button onClick={() => handleAdjustStock(product.id, "add")}>Add Stock</button>
                  <button
                    onClick={() => handleAdjustStock(product.id, "deduct")}
                    disabled={product.quantity < adjustStock}
                  >
                    Deduct Stock
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductManagement;
