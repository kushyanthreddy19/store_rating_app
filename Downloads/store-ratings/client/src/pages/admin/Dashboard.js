"use client"

import { useEffect, useState } from "react"
import api from "../../services/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats")
        setStats(response.data)
        setError("")
      } catch (err) {
        setError("Failed to load dashboard statistics")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>

        <div className="stat-card">
          <h3>Total Stores</h3>
          <div className="stat-value">{stats.totalStores}</div>
        </div>

        <div className="stat-card">
          <h3>Total Ratings</h3>
          <div className="stat-value">{stats.totalRatings}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

