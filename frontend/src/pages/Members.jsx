import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Members() {
  const { isAdmin } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (isAdmin) {
        const { data } = await api.get('/users')
        setMembers(data)
      }
      setLoading(false)
    }
    load()
  }, [isAdmin])

  return (
    <Layout>
      <h1 className="page-title">Members</h1>
      <p className="page-subtitle">Everyone in this private group.</p>

      <div className="card">
        {!isAdmin ? (
          <div className="empty-state">Member directory is visible to administrators. Ask your admin for participant details on shared events.</div>
        ) : loading ? (
          <div className="empty-state">Loading…</div>
        ) : (
          <table>
            <thead>
              <tr><th>Code Name</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td className="codename">{m.codeName}</td>
                  <td>{m.role === 'ADMIN' ? <span className="badge badge-admin">ADMIN</span> : 'Member'}</td>
                  <td>
                    <span className={`badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
