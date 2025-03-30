"use client"

import { useEffect, useState } from "react"
import SortableTable from "../../components/SortableTable"
import api from "../../services/api"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  })
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "user",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/users", { 
        params: filters,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      // Transform the data to ensure proper rating handling
      const transformedUsers = response.data.map(user => ({
        ...user,
        // Ensure averageRating is a number or null
        averageRating: user.role === 'store_owner' 
          ? (user.averageRating ? parseFloat(user.averageRating) : null)
          : null
      }))
      
      setUsers(transformedUsers)
      setError("")
    } catch (err) {
      setError("Failed to load users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const applyFilters = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const resetFilters = () => {
    setFilters({
      name: "",
      email: "",
      address: "",
      role: "",
    })
  }

  const handleNewUserChange = (e) => {
    const { name, value } = e.target
    setNewUser({
      ...newUser,
      [name]: value,
    })
  }

  const addUser = async (e) => {
    e.preventDefault()
    try {
      await api.post("/admin/users", newUser)
      setShowAddUserModal(false)
      setNewUser({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "user",
      })
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user")
    }
  }

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    { key: "role", label: "Role", sortable: true },
    {
      key: "averageRating",
      label: "Store Rating",
      sortable: true,
      render: (row) => {
        // Only show for store owners
        if (row.role !== "store_owner") return "N/A"
        
        // Safely handle the rating display
        const rating = Number(row.averageRating)
        return !isNaN(rating) ? `${rating.toFixed(1)} ★` : "No ratings"
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-edit"
            onClick={(e) => {
              e.stopPropagation()
              // Handle edit user
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-delete"
            onClick={(e) => {
              e.stopPropagation()
              // Handle delete user
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="container">
      <h1>Manage Users</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="actions-bar">
        <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
          Add New User
        </button>
      </div>

      <div className="filters-container">
        <h3>Filters</h3>
        <form onSubmit={applyFilters}>
          <div className="filters-grid">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={filters.name} onChange={handleFilterChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="text" id="email" name="email" value={filters.email} onChange={handleFilterChange} />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input type="text" id="address" name="address" value={filters.address} onChange={handleFilterChange} />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={filters.role} onChange={handleFilterChange}>
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <SortableTable 
          columns={columns} 
          data={users}
          emptyMessage="No users found matching your criteria"
        />
      )}

      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddUserModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={addUser}>
              <div className="form-group">
                <label htmlFor="userName">Name</label>
                <input
                  type="text"
                  id="userName"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  required
                  minLength={20}
                  maxLength={60}
                />
                <small>Name must be between 20 and 60 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="userEmail">Email</label>
                <input
                  type="email"
                  id="userEmail"
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="userAddress">Address</label>
                <textarea
                  id="userAddress"
                  name="address"
                  value={newUser.address}
                  onChange={handleNewUserChange}
                  required
                  maxLength={400}
                />
                <small>Address must be less than 400 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="userPassword">Password</label>
                <input
                  type="password"
                  id="userPassword"
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  required
                  minLength={8}
                  maxLength={16}
                />
                <small>
                  Password must be 8-16 characters with at least one uppercase letter and one special character
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="userRole">Role</label>
                <select id="userRole" name="role" value={newUser.role} onChange={handleNewUserChange} required>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Add User
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .error-message {
          color: #dc3545;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
          background-color: #f8d7da;
          border-radius: 4px;
        }
        
        .actions-bar {
          margin-bottom: 20px;
        }
        
        .filters-container {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input, select, textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 16px;
        }
        
        textarea {
          min-height: 80px;
        }
        
        small {
          display: block;
          margin-top: 5px;
          color: #6c757d;
          font-size: 0.8em;
        }
        
        .filters-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .btn-sm {
          padding: 5px 10px;
          font-size: 14px;
        }
        
        .btn-edit {
          background-color: #ffc107;
          color: #212529;
        }
        
        .btn-delete {
          background-color: #dc3545;
          color: white;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 600px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-actions {
          padding: 20px;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </div>
  )
}

export default AdminUsers