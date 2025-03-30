"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import SortableTable from "../../components/SortableTable"

const StoreOwnerDashboard = () => {
  const [storeData, setStoreData] = useState({
    store: null,
    ratings: [],
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStoreData()
  }, [])

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      const response = await api.get("/store-owner/dashboard")
      setStoreData(response.data)
      setError("")
    } catch (err) {
      setError("Failed to load store data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: "userName", label: "User Name", sortable: true },
    { key: "userEmail", label: "Email", sortable: true },
    { key: "rating", label: "Rating", sortable: true },
    {
      key: "ratedAt",
      label: "Rated On",
      sortable: true,
      render: (row) => new Date(row.ratedAt).toLocaleDateString(),
    },
  ]

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (!storeData.store) {
    return (
      <div className="container">
        <h1>Store Owner Dashboard</h1>
        <div className="error-message">No store associated with your account</div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Store Owner Dashboard</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="store-info">
        <h2>{storeData.store.name}</h2>
        <p>
          <strong>Email:</strong> {storeData.store.email}
        </p>
        <p>
          <strong>Address:</strong> {storeData.store.address}
        </p>
        <p>
          <strong>Average Rating:</strong> {storeData.averageRating.toFixed(1)} / 5
        </p>
      </div>

      <div className="ratings-section">
        <h3>User Ratings</h3>
        {storeData.ratings.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <SortableTable columns={columns} data={storeData.ratings} />
        )}
      </div>
    </div>
  )
}

export default StoreOwnerDashboard

