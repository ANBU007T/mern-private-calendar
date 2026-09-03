import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ codeName: '', password: '', role: 'MEMBER' })
  const [error, setError] = useState('')
  const [resetTarget, setResetTarget] = useState(null)
  const [resetPassword, setResetPassword] = useState('')

  const load = async () => {
    const { data } = await api.get('/users')
    setMembers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/users', form)
      setShowAdd(false)
      setForm({ codeName: '', password: '', role: 'MEMBER' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create member')
    }
  }

  const toggleStatus = async (m) => {
    const newStatus = m.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    await api.put(`/users/${m.id}`, { status: newStatus })
    load()
  }

  const handleDelete = async (m) => {
    if (!confirm(`Delete member ${m.codeName}? This cannot be undone.`)) return
    await api.delete(`/users/${m.id}`)
    load()
  }

  const handleReset = async (e) => {
    e.preventDefault()
    await api.post(`/users/${resetTarget.id}/reset-password`, { newPassword: resetPassword })
    setResetTarget(null)
    setResetPassword('')
  }

  return (
    <Layout>
      <div className="calendar-header">
        <div>
          <h1 className="page-title">Manage Members</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Add, disable, or remove group members.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Member</button>
      </div>

      <div className="card">
        {loading ? <div className="empty-state">Loading…</div> : (
          <table>
            <thead>
              <tr><th>Code Name</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td className="codename">{m.codeName}</td>
                  <td>{m.role === 'ADMIN' ? <span className="badge badge-admin">ADMIN</span> : 'Member'}</td>
                  <td><span className={`badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>{m.status}</span></td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost" onClick={() => toggleStatus(m)}>
                      {m.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setResetTarget(m)}>Reset Password</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(m)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleAdd}>
            <div className="modal-title">Add Member</div>
            {error && <div className="error-banner">{error}</div>}
            <div className="field">
              <label>Code Name</label>
              <input className="codename" value={form.codeName} onChange={(e) => setForm(f => ({ ...f, codeName: e.target.value.toUpperCase() }))} placeholder="TIGER" required />
            </div>
            <div className="field">
              <label>Temporary Password</label>
              <input type="text" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 8 characters" required />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Member</button>
            </div>
          </form>
        </div>
      )}

      {resetTarget && (
        <div className="modal-backdrop" onClick={() => setResetTarget(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleReset}>
            <div className="modal-title">Reset Password for <span className="codename">{resetTarget.codeName}</span></div>
            <div className="field">
              <label>New Temporary Password</label>
              <input type="text" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setResetTarget(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Reset Password</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}
