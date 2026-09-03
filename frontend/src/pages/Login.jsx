import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [codeName, setCodeName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(codeName, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code name or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <form className="card login-card" onSubmit={handleSubmit}>
        <div className="login-title">Private Calendar</div>
        <div className="login-sub">INVITATION-ONLY ACCESS</div>

        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label>Code Name</label>
          <input
            className="codename"
            value={codeName}
            onChange={(e) => setCodeName(e.target.value)}
            placeholder="EAGLE"
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '1.25rem' }}>
          Accounts are created by an administrator only.<br />
          Contact your group admin if you need access.
        </p>
      </form>
    </div>
  )
}
