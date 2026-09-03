import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import EventModal from '../components/EventModal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const dayOfWeek = (first.getDay() + 6) % 7 // Monday = 0
  const start = new Date(year, month, 1 - dayOfWeek)
  return start
}

export default function CalendarPage() {
  const { isAdmin } = useAuth()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [categories, setCategories] = useState([])
  const [modalState, setModalState] = useState(null) // { event } | { defaultDate } | null

  const monthLabel = new Date(cursor.year, cursor.month).toLocaleString(undefined, { month: 'long', year: 'numeric' }).toUpperCase()

  const gridStart = useMemo(() => startOfMonthGrid(cursor.year, cursor.month), [cursor])
  const days = useMemo(() => {
    const arr = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      arr.push(d)
    }
    return arr
  }, [gridStart])

  const loadEvents = async () => {
    const from = new Date(cursor.year, cursor.month - 1, 1).toISOString()
    const to = new Date(cursor.year, cursor.month + 2, 0).toISOString()
    const { data } = await api.get('/events', { params: { from, to } })
    setEvents(data)
  }

  useEffect(() => { loadEvents() }, [cursor])

  useEffect(() => {
    async function loadStatic() {
      try {
        const [membersRes, categoriesRes] = await Promise.all([
          isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
          api.get('/categories')
        ])
        setMembers(membersRes.data)
        setCategories(categoriesRes.data)
      } catch {
        setCategories([])
      }
    }
    loadStatic()
  }, [isAdmin])

  const eventsByDate = useMemo(() => {
    const map = {}
    for (const ev of events) {
      const key = new Date(ev.startTime).toDateString()
      if (!map[key]) map[key] = []
      map[key].push(ev)
    }
    return map
  }, [events])

  const todayStr = new Date().toDateString()

  const goToday = () => {
    const d = new Date()
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }
  const prevMonth = () => setCursor(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 })
  const nextMonth = () => setCursor(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 })

  const closeModal = () => setModalState(null)
  const handleSaved = () => { closeModal(); loadEvents() }

  return (
    <Layout>
      <div className="calendar-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Month view · group and personal events</p>
        </div>
        <div className="calendar-nav">
          <button className="btn" onClick={prevMonth}>‹</button>
          <div className="calendar-month-label">{monthLabel}</div>
          <button className="btn" onClick={nextMonth}>›</button>
          <button className="btn" onClick={goToday}>Today</button>
          <button className="btn btn-primary" onClick={() => setModalState({ defaultDate: new Date().toISOString() })}>+ New Event</button>
        </div>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map(w => <div key={w} className="calendar-weekday">{w}</div>)}
        {days.map((d, i) => {
          const outside = d.getMonth() !== cursor.month
          const isToday = d.toDateString() === todayStr
          const dayEvents = eventsByDate[d.toDateString()] || []
          return (
            <div
              key={i}
              className={`calendar-cell${outside ? ' outside' : ''}${isToday ? ' today' : ''}`}
              onClick={() => setModalState({ defaultDate: d.toISOString() })}
            >
              <div className="calendar-day-num">{d.getDate()}</div>
              {dayEvents.slice(0, 3).map(ev => (
                <div
                  key={ev.id}
                  className="calendar-event-pill"
                  onClick={(e) => { e.stopPropagation(); setModalState({ event: ev }) }}
                >
                  {ev.categoryIcon} {ev.title}
                </div>
              ))}
              {dayEvents.length > 3 && <div className="task-meta">+{dayEvents.length - 3} more</div>}
            </div>
          )
        })}
      </div>

      {modalState && (
        <EventModal
          event={modalState.event}
          defaultDate={modalState.defaultDate}
          members={members}
          categories={categories}
          canEditAll={isAdmin}
          onClose={closeModal}
          onSaved={handleSaved}
          onDeleted={handleSaved}
        />
      )}
    </Layout>
  )
}
