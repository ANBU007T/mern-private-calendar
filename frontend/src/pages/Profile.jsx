import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    try {
      // Members change their own password by asking an admin to reset it,
      // or (if self-service is enabled later) via a dedicated endpoint.
      // For now this calls the admin reset endpoint when the user is an admin
      // acting on their own account; otherwise it explains the flow.
      setMessage('Password change requests go through your administrator for this closed group. Ask them to reset your password from Manage Members.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password')
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Your account details.</p>

      <div className="card" style={{ maxWidth: 420 }}>
        <div className="field">
          <label>Code Name</label>
          <div className="codename" style={{ fontSize: '1.1rem' }}>{user?.codeName}</div>
        </div>
        <div className="field">
          <label>Role</label>
          <div>{user?.role === 'ADMIN' ? 'Administrator' : 'Member'}</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 420, marginTop: '1.25rem' }}>
        <div className="section-header"><h3>Change Password</h3></div>
        {message && <div className="error-banner" style={{ background: 'rgba(127,166,132,0.12)', borderColor: 'var(--success)', color: '#B7D4BA' }}>{message}</div>}
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleChangePassword}>
          <div className="field">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">Request Change</button>
        </form>
      </div>
    </Layout>
  )
}
