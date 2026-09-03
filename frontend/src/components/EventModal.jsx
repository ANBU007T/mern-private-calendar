import { useEffect, useState } from 'react'
import api from '../services/api'

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const REMINDER_OPTIONS = [
  ['NONE', 'No Reminder'],
  ['MIN_5', '5 minutes before'],
  ['MIN_15', '15 minutes before'],
  ['MIN_30', '30 minutes before'],
  ['HOUR_1', '1 hour before'],
  ['DAY_1', '1 day before']
]

export default function EventModal({ event, defaultDate, members, categories, onClose, onSaved, onDeleted, canEditAll }) {
  const isEdit = !!event?.id
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startTime: toLocalInput(event?.startTime) || toLocalInput(defaultDate),
    endTime: toLocalInput(event?.endTime) || toLocalInput(defaultDate),
    categoryId: event?.categoryId || '',
    reminder: event?.reminder || 'NONE',
    personal: event?.personal ?? true,
    participantIds: event?.participantIds || []
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const toggleParticipant = (id) => {
    setForm(f => ({
      ...f,
      participantIds: f.participantIds.includes(id)
        ? f.participantIds.filter(p => p !== id)
        : [...f.participantIds, id]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        categoryId: form.categoryId || null,
        reminder: form.reminder,
        personal: form.personal,
        participantIds: form.participantIds
      }
      if (isEdit) {
        await api.put(`/events/${event.id}`, payload)
      } else {
        await api.post('/events', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this event?')) return
    await api.delete(`/events/${event.id}`)
    onDeleted()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-title">{isEdit ? 'Edit Event' : 'New Event'}</div>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} required />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Start Time</label>
            <input type="datetime-local" value={form.startTime} onChange={(e) => handleChange('startTime', e.target.value)} required />
          </div>
          <div className="field">
            <label>End Time</label>
            <input type="datetime-local" value={form.endTime} onChange={(e) => handleChange('endTime', e.target.value)} required />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Category</label>
            <select value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)}>
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Reminder</label>
            <select value={form.reminder} onChange={(e) => handleChange('reminder', e.target.value)}>
              {REMINDER_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
        </div>

        {canEditAll && (
          <div className="field">
            <label>
              <input
                type="checkbox"
                style={{ width: 'auto', marginRight: '0.5rem' }}
                checked={!form.personal}
                onChange={(e) => handleChange('personal', !e.target.checked)}
              />
              Group-wide event (visible to everyone)
            </label>
          </div>
        )}

        <div className="field">
          <label>Participants</label>
          <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 4, padding: '0.5rem' }}>
            {members.map(m => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={form.participantIds.includes(m.id)}
                  onChange={() => toggleParticipant(m.id)}
                />
                <span className="codename">{m.codeName}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          {isEdit && <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>}
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Event'}</button>
        </div>
      </form>
    </div>
  )
}
