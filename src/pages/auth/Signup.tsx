import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { UserPlus } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join DigiStore and get started</p>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="signup-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="signup-password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button id="signup-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            <UserPlus size={16} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-divider" style={{ marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
