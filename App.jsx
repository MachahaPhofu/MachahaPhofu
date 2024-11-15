import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import Dashboard from "./Dashboard";
import ProductManagement from "./ProductManagement";
import UserManagement from "./UserManagement";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [view, setView] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts(); // Fetch products when authenticated
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5009/api/products"); // Use axios to fetch data
      setProducts(response.data); // Axios directly gives you the data in the response
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addProduct = async (product) => {
    try {
      const response = await axios.post("http://localhost:5009/api/products", product);
      setProducts((prevProducts) => [...prevProducts, { ...product, id: response.data.productId }]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const updateProduct = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5009/api/products/${id}`);
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddStock = (id, quantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === id) {
          const newQuantity = product.quantity + quantity;
          const stockHistory = [
            ...product.stockHistory,
            { type: "added", quantity, date: new Date().toLocaleString() },
          ];
          return { ...product, quantity: newQuantity, stockHistory };
        }
        return product;
      })
    );
  };

  const handleDeductStock = (id, quantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === id && product.quantity >= quantity) {
          const newQuantity = product.quantity - quantity;
          const stockHistory = [
            ...product.stockHistory,
            { type: "deducted", quantity, date: new Date().toLocaleString() },
          ];
          return { ...product, quantity: newQuantity, stockHistory };
        }
        return product;
      })
    );
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView("login");
  };

  return (
    <div>
      <marquee>
      <h1>Wings Inventory System</h1></marquee>
      
      {!isAuthenticated ? (
        view === "login" ? (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setView("register")} />
        ) : (
          <Register onSwitchToLogin={() => setView("login")} />
        )
      ) : (
        <>
          <nav>
            <button onClick={() => setView("dashboard")}>Dashboard</button>
            <button onClick={() => setView("productManagement")}>Product Management</button>
            <button onClick={() => setView("userManagement")}>User Management</button>
            <button onClick={handleLogout}>Logout</button>
          </nav>
          <hr />
          {view === "dashboard" && <Dashboard products={products} />}
          {view === "productManagement" && (
            <ProductManagement
              addProduct={addProduct}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
              handleAddStock={handleAddStock}
              handleDeductStock={handleDeductStock}
              products={products}
            />
          )}
          {view === "userManagement" && <UserManagement />}
        </>
      )}
    </div>
  );
}

export default App;
