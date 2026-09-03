import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const STATUS_CYCLE = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: 'PENDING' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await api.get('/tasks')
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleStatus = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    await api.put(`/tasks/${task.id}/status`, { status: nextStatus })
    load()
  }

  const pending = tasks.filter(t => t.status !== 'COMPLETED')
  const completed = tasks.filter(t => t.status === 'COMPLETED')

  return (
    <Layout>
      <h1 className="page-title">My Tasks</h1>
      <p className="page-subtitle">Tasks assigned to you. Tap the checkbox to mark complete.</p>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="section-header"><h3>Pending ({pending.length})</h3></div>
        {loading ? <div className="empty-state">Loading…</div> : pending.length === 0 ? (
          <div className="empty-state">No pending tasks. Nice work.</div>
        ) : pending.map(t => (
          <div key={t.id} className="task-item">
            <div className={`task-checkbox`} onClick={() => toggleStatus(t)} />
            <div style={{ flex: 1 }}>
              <div className="task-title">
                {t.title}
                <span className={`priority-tag priority-${t.priority}`}>{t.priority}</span>
              </div>
              {t.description && <div className="task-meta">{t.description}</div>}
              <div className="task-meta">
                {t.dueDate ? `Due ${t.dueDate}` : 'No due date'} · Assigned by <span className="codename">{t.createdByCodeName}</span>
              </div>
            </div>
            <select
              value={t.status}
              onChange={async (e) => { await api.put(`/tasks/${t.id}/status`, { status: e.target.value }); load() }}
              style={{ width: 'auto', fontSize: '0.78rem' }}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-header"><h3>Completed ({completed.length})</h3></div>
        {completed.length === 0 ? (
          <div className="empty-state">Nothing completed yet.</div>
        ) : completed.map(t => (
          <div key={t.id} className="task-item">
            <div className="task-checkbox done" onClick={() => toggleStatus(t)}>✓</div>
            <div style={{ flex: 1 }}>
              <div className="task-title done">{t.title}</div>
              <div className="task-meta">{t.dueDate ? `Was due ${t.dueDate}` : ''}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
