import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase, type Product } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Plus, Pencil, Trash2, LayoutDashboard, Package, ShoppingBag, LogOut, X, Image } from 'lucide-react'

const CATEGORIES = ['instagram_account', 'general']

const emptyForm = { title: '', description: '', price: '', category: 'instagram_account', images: '' as string, stock_status: true }

export default function AdminProducts() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data as Product[])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function openAdd() { setForm(emptyForm); setEditId(null); setModalOpen(true) }

  function openEdit(p: Product) {
    setForm({ title: p.title, description: p.description, price: String(p.price), category: p.category, images: p.images?.join(', ') || '', stock_status: p.stock_status })
    setEditId(p.id)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title || !form.price) { showToast('Title and price are required.', 'error'); return }
    setSaving(true)
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      stock_status: form.stock_status,
    }

    if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId)
      if (error) showToast('Failed to update product.', 'error')
      else { showToast('Product updated!'); fetchProducts() }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) showToast('Failed to add product.', 'error')
      else { showToast('Product added!'); fetchProducts() }
    }
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) showToast('Failed to delete.', 'error')
    else { showToast('Product deleted!'); fetchProducts() }
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

        <main className="admin-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Products</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{products.length} products total</p>
            </div>
            <button id="add-product-btn" className="btn btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Image size={18} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                          <span style={{ fontWeight: 600 }}>{p.title}</span>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{p.category.replace('_', ' ')}</td>
                      <td style={{ fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`tag ${p.stock_status ? 'tag-completed' : 'tag-cancelled'}`}>
                          {p.stock_status ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Pencil size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input id="product-title" className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Instagram Account 10K Followers" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="product-desc" className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the product..." rows={3} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input id="product-price" type="number" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="999" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select id="product-category" className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URLs (comma separated)</label>
                <input id="product-images" className="form-input" value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://..., https://..." />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input id="product-stock" type="checkbox" checked={form.stock_status} onChange={e => setForm(f => ({ ...f, stock_status: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                <label htmlFor="product-stock" className="form-label" style={{ margin: 0 }}>In Stock</label>
              </div>
              <button id="save-product-btn" className="btn btn-primary btn-lg w-full" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
