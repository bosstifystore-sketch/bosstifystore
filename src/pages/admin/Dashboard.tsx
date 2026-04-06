import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}


export default function Dashboard() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 })
  const [followerRate, setFollowerRate] = useState('90')
  const [savingRate, setSavingRate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  
  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchStats() {
    const [{ count: products }, { data: orders }, { data: rateData }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('product_details, status'),
      supabase.from('settings').select('*').eq('key', 'follower_rate').single()
    ])

    if (rateData && rateData.value) {
      setFollowerRate(String(rateData.value))
    }

    const revenue = (orders || []).reduce((sum, o) => {
      const details = o.product_details as Record<string, number>
      return sum + (Number(details?.price) || 0)
    }, 0)
    const pending = (orders || []).filter(o => o.status === 'pending').length

    setStats({ totalProducts: products || 0, totalOrders: orders?.length || 0, totalRevenue: revenue, pendingOrders: pending })
    setLoading(false)
  }

  useEffect(() => { fetchStats() }, [])

  async function updateRate() {
    setSavingRate(true)
    const val = parseFloat(followerRate)
    if (isNaN(val) || val <= 0) {
      showToast('Enter a valid rate', 'error')
      setSavingRate(false)
      return
    }
    const { error } = await supabase.from('settings').upsert({ key: 'follower_rate', value: val })
    if (error) showToast('Failed to update rate', 'error')
    else showToast('Rate updated successfully!')
    setSavingRate(false)
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/products', label: 'Products', icon: <Package size={18} /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  ]

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div style={{ padding: '8px 14px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>⚡ Admin Panel</span>
          </div>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <button onClick={signOut} className="admin-nav-item" style={{ width: '100%', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="admin-content">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Overview of your store</p>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)' }}><Package size={22} style={{ color: '#a855f7' }} /></div>
                <p className="stat-label">Total Products</p>
                <p className="stat-value">{stats.totalProducts}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><ShoppingBag size={22} style={{ color: '#10b981' }} /></div>
                <p className="stat-label">Total Orders</p>
                <p className="stat-value">{stats.totalOrders}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><span style={{ fontSize: '1.2rem' }}>₹</span></div>
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><LayoutDashboard size={22} style={{ color: '#ef4444' }} /></div>
                <p className="stat-label">Pending Orders</p>
                <p className="stat-value">{stats.pendingOrders}</p>
              </div>
            </div>

            {/* SETTINGS MODULE */}
            <div style={{ marginTop: 40 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Service Settings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure automated dynamic services here</p>
              </div>
              
              <div className="card" style={{ maxWidth: 400 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Instagram Followers Rate</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>Set the static price for every 1000 followers requested by customers dynamically.</p>
                
                <div className="form-group">
                  <label className="form-label">Price per 1000 Followers (₹)</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={followerRate}
                      onChange={e => setFollowerRate(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={updateRate} disabled={savingRate} style={{ padding: '0 24px' }}>
                      {savingRate ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </main>
      </div>
    </div>
  )
}
