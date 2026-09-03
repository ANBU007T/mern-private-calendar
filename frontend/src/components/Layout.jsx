import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <div className="app-shell">

      {/* Mobile Header */}
      <header className="mobile-header">
        <div>
          <div className="mobile-brand">Private Calendar</div>
          <div className="mobile-sub">INVITATION ONLY</div>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">

          <NavLink
            to="/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/calendar"
            onClick={closeMenu}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Calendar
          </NavLink>

          <NavLink
            to="/tasks"
            onClick={closeMenu}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            My Tasks
          </NavLink>

          <NavLink
            to="/members"
            onClick={closeMenu}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Members
          </NavLink>

          <NavLink
            to="/profile"
            onClick={closeMenu}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Profile
          </NavLink>

          {isAdmin && (
            <>
              <div className="sidebar-divider" />

              <NavLink
                to="/admin/members"
                onClick={closeMenu}
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
              >
                Manage Members
              </NavLink>

              <NavLink
                to="/admin/tasks"
                onClick={closeMenu}
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
              >
                Assign Tasks
              </NavLink>
            </>
          )}

          <div className="mobile-user">
            Signed in as{' '}
            <span className="codename">{user?.codeName}</span>
          </div>

          <button
            className="btn btn-ghost mobile-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          Private Calendar
        </div>

        <div className="sidebar-sub">
          INVITATION ONLY
        </div>

        <nav className="sidebar-nav">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Calendar
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            My Tasks
          </NavLink>

          <NavLink
            to="/members"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Members
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            Profile
          </NavLink>

          {isAdmin && (
            <>
              <div className="sidebar-divider" />

              <NavLink
                to="/admin/members"
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
              >
                Manage Members
              </NavLink>

              <NavLink
                to="/admin/tasks"
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
              >
                Assign Tasks
              </NavLink>
            </>
          )}

        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-footer">
          Signed in as
          <br />

          <span
            className="codename"
            style={{ color: 'var(--text)' }}
          >
            {user?.codeName}
          </span>
        </div>

        <button
          className="btn btn-ghost"
          style={{
            marginTop: '0.75rem',
            width: '100%'
          }}
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

    </div>
  )
}
