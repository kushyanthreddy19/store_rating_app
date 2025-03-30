"use client"

import { useEffect, useState } from "react"
import SortableTable from "../../components/SortableTable"
import api from "../../services/api"

const UserDashboard = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [filters, setFilters] = useState({
    name: "",
    address: "",
  })
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [rating, setRating] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const response = await api.get("/user/stores", { 
        params: filters,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      // Validate and transform data
      const validatedData = response.data.map(store => ({
        ...store,
        rating: store.rating ? Number(store.rating) : null,
        userRating: store.userRating ? Number(store.userRating) : null
      }))
      
      setStores(validatedData)
      setError("")
    } catch (err) {
      setError("Failed to load stores. Please try again.")
      console.error("Fetch stores error:", err)
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
      address: "",
    })
  }

  const openRatingModal = (store) => {
    setSelectedStore(store)
    setRating(store.userRating || 0)
    setShowRatingModal(true)
    setError("")
    setSuccessMessage("")
  }

  const submitRating = async (e) => {
    e.preventDefault()
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5")
      return
    }

    setRatingLoading(true)
    
    try {
      // Optimistic update
      const updatedStores = stores.map(store => 
        store.id === selectedStore.id 
          ? { 
              ...store, 
              userRating: rating,
              rating: calculateNewAverage(store.rating, rating, store.userRating)
            } 
          : store
      )
      setStores(updatedStores)

      // Submit to server
      const response = await api.post(
        `/user/stores/${selectedStore.id}/rate`, 
        { rating },
        {
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      )

      // Update with server data
      setStores(prev => 
        prev.map(store => 
          store.id === response.data.store.id 
            ? { 
                ...store, 
                rating: response.data.store.rating,
                userRating: response.data.store.user_rating
              } 
            : store
        )
      )

      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(""), 3000)
      setShowRatingModal(false)
    } catch (err) {
      // Revert optimistic update on error
      setStores(prev => 
        prev.map(store => 
          store.id === selectedStore.id ? selectedStore : store
        )
      )
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.message || 
                      "Failed to submit rating"
      setError(errorMsg)
      console.error("Rating submission error:", err)
    } finally {
      setRatingLoading(false)
    }
  }

  const calculateNewAverage = (currentAvg, newRating, oldRating) => {
    if (!oldRating) {
      // New rating - simple average for demo (would need rating count in real app)
      return currentAvg ? ((currentAvg + newRating) / 2) : newRating
    } else {
      // Updated rating - simple calculation for demo
      return currentAvg + (newRating - oldRating) / 2
    }
  }

  const columns = [
    { key: "name", label: "Store Name", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "rating",
      label: "Overall Rating",
      sortable: true,
      render: (row) => {
        const numericRating = Number(row.rating)
        return !isNaN(numericRating) ? `${numericRating.toFixed(1)} ★` : "No ratings"
      },
    },
    {
      key: "userRating",
      label: "Your Rating",
      sortable: true,
      render: (row) => {
        const numericRating = Number(row.userRating)
        return !isNaN(numericRating) ? `${numericRating} ★` : "Not rated"
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <button
          className="rate-button"
          onClick={(e) => {
            e.stopPropagation()
            openRatingModal(row)
          }}
          disabled={ratingLoading}
        >
          {row.userRating ? "Update Rating" : "Rate Store"}
        </button>
      ),
    },
  ]

  return (
    <div className="user-dashboard">
      <h1>Stores</h1>
      
      {/* Status messages */}
      {successMessage && (
        <div className="alert success">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <h3>Search Stores</h3>
        <form onSubmit={applyFilters}>
          <div className="filter-grid">
            <div className="form-group">
              <label htmlFor="name">Store Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={filters.name} 
                onChange={handleFilterChange} 
                placeholder="Search by name..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input 
                type="text" 
                id="address" 
                name="address" 
                value={filters.address} 
                onChange={handleFilterChange} 
                placeholder="Search by address..."
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn primary">
              Search
            </button>
            <button 
              type="button" 
              className="btn secondary" 
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Stores table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading stores...</p>
        </div>
      ) : (
        <SortableTable 
          columns={columns} 
          data={stores} 
          emptyMessage="No stores found matching your criteria"
        />
      )}

      {/* Rating modal */}
      {showRatingModal && selectedStore && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {selectedStore.userRating ? "Update Your Rating" : "Rate This Store"}
              </h2>
              <button 
                className="close-button" 
                onClick={() => setShowRatingModal(false)}
                disabled={ratingLoading}
              >
                &times;
              </button>
            </div>

            <form onSubmit={submitRating}>
              <div className="modal-body">
                <div className="store-info">
                  <h3>{selectedStore.name}</h3>
                  <p>{selectedStore.address}</p>
                </div>

                <div className="rating-input">
                  <label>Your Rating:</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star ${star <= rating ? "active" : ""}`}
                        onClick={() => setRating(star)}
                        disabled={ratingLoading}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="rating-value">
                    Selected: {rating} star{rating !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowRatingModal(false)}
                  disabled={ratingLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={ratingLoading}
                >
                  {ratingLoading ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "Submit Rating"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #333;
          margin-bottom: 30px;
        }
        
        .alert {
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .alert.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .alert.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .filters {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .filter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
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
        
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .filter-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .btn.primary {
          background-color: #007bff;
          color: white;
        }
        
        .btn.primary:hover {
          background-color: #0069d9;
        }
        
        .btn.secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .btn.secondary:hover {
          background-color: #5a6268;
        }
        
        .loading-state {
          text-align: center;
          padding: 40px;
        }
        
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #007bff;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .rate-button {
          background-color: #17a2b8;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .rate-button:hover {
          background-color: #138496;
        }
        
        .rate-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .modal-backdrop {
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
          max-width: 500px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .store-info {
          margin-bottom: 20px;
        }
        
        .rating-input {
          margin-bottom: 20px;
        }
        
        .stars {
          display: flex;
          gap: 10px;
          margin: 10px 0;
        }
        
        .star {
          background: none;
          border: none;
          font-size: 30px;
          color: #e4e5e9;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }
        
        .star.active {
          color: #ffc107;
        }
        
        .star:hover:not(.active) {
          color: #ffc107;
          opacity: 0.7;
        }
        
        .rating-value {
          font-size: 14px;
          color: #6c757d;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </div>
  )
}

export default UserDashboard