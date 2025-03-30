"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Store Ratings App</Link>
      </div>
      <div className="navbar-menu">
        {user.role === "admin" && (
          <>
            <Link to="/admin/dashboard" className="navbar-item">
              Dashboard
            </Link>
            <Link to="/admin/stores" className="navbar-item">
              Stores
            </Link>
            <Link to="/admin/users" className="navbar-item">
              Users
            </Link>
          </>
        )}

        {user.role === "user" && (
          <Link to="/user/dashboard" className="navbar-item">
            Stores
          </Link>
        )}

        {user.role === "store_owner" && (
          <Link to="/store-owner/dashboard" className="navbar-item">
            Dashboard
          </Link>
        )}

        <div className="navbar-right">
          <Link to="/change-password" className="navbar-item">
            Change Password
          </Link>
          <button onClick={handleLogout} className="btn btn-link">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

