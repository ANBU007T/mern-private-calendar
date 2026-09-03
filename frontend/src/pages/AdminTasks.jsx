import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

export default function AdminTasks() {
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', assignedToId: '', dueDate: '', priority: 'MEDIUM' })
  const [error, setError] = useState('')

  const load = async () => {
    const [tasksRes, membersRes] = await Promise.all([
      api.get('/tasks', { params: { all: true } }),
      api.get('/users')
    ])
    setTasks(tasksRes.data)
    setMembers(membersRes.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/tasks', form)
      setShowAdd(false)
      setForm({ title: '', description: '', assignedToId: '', dueDate: '', priority: 'MEDIUM' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create task')
    }
  }

  const handleDelete = async (t) => {
    if (!confirm(`Delete task "${t.title}"?`)) return
    await api.delete(`/tasks/${t.id}`)
    load()
  }

  return (
    <Layout>
      <div className="calendar-header">
        <div>
          <h1 className="page-title">Assign Tasks</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Create and track tasks across the whole group.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Task</button>
      </div>

      <div className="card">
        {loading ? <div className="empty-state">Loading…</div> : tasks.length === 0 ? (
          <div className="empty-state">No tasks yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Task</th><th>Assigned To</th><th>Due</th><th>Priority</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td className="codename">{t.assignedToCodeName}</td>
                  <td>{t.dueDate || '—'}</td>
                  <td><span className={`priority-tag priority-${t.priority}`}>{t.priority}</span></td>
                  <td>{t.status}</td>
                  <td><button className="btn btn-danger" onClick={() => handleDelete(t)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleAdd}>
            <div className="modal-title">New Task</div>
            {error && <div className="error-banner">{error}</div>}
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="field">
              <label>Assign To</label>
              <select value={form.assignedToId} onChange={(e) => setForm(f => ({ ...f, assignedToId: e.target.value }))} required>
                <option value="">Select member…</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.codeName}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="field">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Task</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}
