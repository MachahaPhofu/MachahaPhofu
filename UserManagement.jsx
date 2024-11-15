import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]); // Store users
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' }); // Store new user input
  const [loading, setLoading] = useState(false); // Manage loading state

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5009/api/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Add new user
  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('http://localhost:5009/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const result = await response.json();
      if (response.status === 201) {
        alert('User added successfully');
        setUsers((prevUsers) => [...prevUsers, { id: result.userId, ...newUser }]);
        setNewUser({ name: '', email: '', role: '' });
      } else {
        throw new Error(result.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error.message);
      alert(error.message);
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5009/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('User deleted successfully');
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Users Management</h2>

      {/* New User Form */}
      <div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newUser.name}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="role"
          placeholder="Role (e.g., manager, staff)"
          value={newUser.role}
          onChange={handleInputChange}
        />
        <button onClick={addUser}>Add User</button>
      </div>

      {/* Loading Indicator */}
      {loading && <p>Loading...</p>}

      {/* Users Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => deleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
