import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatDateTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [eventsRes, tasksRes] = await Promise.all([
        api.get('/events/upcoming'),
        api.get('/tasks')
      ])
      setEvents(eventsRes.data)
      setTasks(tasksRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date().toDateString()
  const todayEvents = events.filter(e => new Date(e.startTime).toDateString() === today)
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')

  return (
    <Layout>
      <h1 className="page-title">Welcome, {user?.codeName}</h1>
      <p className="page-subtitle">Here's what's happening in your group.</p>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-number">{todayEvents.length}</div>
          <div className="stat-label">Today's Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{events.length}</div>
          <div className="stat-label">Upcoming Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pendingTasks.length}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completedTasks.length}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><h3>Upcoming Events</h3></div>
          {loading ? <div className="empty-state">Loading…</div> : events.length === 0 ? (
            <div className="empty-state">No upcoming events.</div>
          ) : (
            events.slice(0, 6).map(ev => (
              <div key={ev.id} className="task-item">
                <div>
                  <div className="task-title">{ev.categoryIcon} {ev.title}</div>
                  <div className="task-meta">{formatDateTime(ev.startTime)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="section-header"><h3>Pending Tasks</h3></div>
          {loading ? <div className="empty-state">Loading…</div> : pendingTasks.length === 0 ? (
            <div className="empty-state">Nothing pending. Well done.</div>
          ) : (
            pendingTasks.slice(0, 6).map(t => (
              <div key={t.id} className="task-item">
                <div>
                  <div className="task-title">{t.title}
                    <span className={`priority-tag priority-${t.priority}`}>{t.priority}</span>
                  </div>
                  <div className="task-meta">{t.dueDate ? `Due ${t.dueDate}` : 'No due date'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
