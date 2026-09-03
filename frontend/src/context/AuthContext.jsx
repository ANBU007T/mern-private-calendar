import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pc_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (codeName, password) => {
    const { data } = await api.post('/auth/login', { codeName, password })
    localStorage.setItem('pc_token', data.token)
    const userData = {
      codeName: data.codeName,
      role: data.role,
      mustChangePassword: data.mustChangePassword
    }
    localStorage.setItem('pc_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pc_token')
    localStorage.removeItem('pc_user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
