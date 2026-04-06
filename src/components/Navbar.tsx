import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, LogOut, Package, LayoutDashboard, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">⚡ DigiStore</Link>

      <div className="navbar-links">
        <Link to="/" className="navbar-link">Products</Link>
        <Link to="/followers" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={15} /> Buy Followers
        </Link>

        {user ? (
          <>
            <Link to="/orders" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={15} /> My Orders
            </Link>
            {isAdmin && (
              <Link to="/admin/dashboard" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7' }}>
                <LayoutDashboard size={15} /> Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              <ShoppingBag size={14} /> Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
