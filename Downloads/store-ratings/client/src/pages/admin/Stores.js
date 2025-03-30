"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SortableTable from "../../components/SortableTable"
import api from "../../services/api"

const AdminStores = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  })
  const [showAddStoreModal, setShowAddStoreModal] = useState(false)
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/stores", { params: filters })
      
      // Transform the data to ensure ratings are properly handled
      const transformedStores = response.data.map(store => ({
        ...store,
        rating: store.rating ? parseFloat(store.rating) : null
      }))
      
      setStores(transformedStores)
      setError("")
    } catch (err) {
      setError("Failed to load stores")
      console.error(err)
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
    fetchStores()
  }

  const resetFilters = () => {
    setFilters({
      name: "",
      email: "",
      address: "",
    })
  }

  const handleNewStoreChange = (e) => {
    const { name, value } = e.target
    setNewStore({
      ...newStore,
      [name]: value,
    })
  }

  const addStore = async (e) => {
    e.preventDefault()
    try {
      await api.post("/admin/stores", newStore)
      setShowAddStoreModal(false)
      setNewStore({
        name: "",
        email: "",
        address: "",
      })
      fetchStores()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add store")
    }
  }

  const columns = [
    { key: "name", label: "Store Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "rating",
      label: "Average Rating",
      sortable: true,
      render: (row) => {
        // Safely handle rating display
        const rating = parseFloat(row.rating)
        return !isNaN(rating) ? rating.toFixed(1) : "No ratings"
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
              // Handle edit store
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-delete"
            onClick={(e) => {
              e.stopPropagation()
              // Handle delete store
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
      <h1>Manage Stores</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="actions-bar">
        <button className="btn btn-primary" onClick={() => setShowAddStoreModal(true)}>
          Add New Store
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
        <div className="loading">Loading stores...</div>
      ) : (
        <SortableTable 
          columns={columns} 
          data={stores} 
          onRowClick={(row) => navigate(`/admin/stores/${row.id}`)}
        />
      )}

      {showAddStoreModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Store</h2>
              <button className="modal-close" onClick={() => setShowAddStoreModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={addStore}>
              <div className="form-group">
                <label htmlFor="storeName">Store Name</label>
                <input
                  type="text"
                  id="storeName"
                  name="name"
                  value={newStore.name}
                  onChange={handleNewStoreChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeEmail">Email</label>
                <input
                  type="email"
                  id="storeEmail"
                  name="email"
                  value={newStore.email}
                  onChange={handleNewStoreChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeAddress">Address</label>
                <textarea
                  id="storeAddress"
                  name="address"
                  value={newStore.address}
                  onChange={handleNewStoreChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Add Store
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStoreModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminStores