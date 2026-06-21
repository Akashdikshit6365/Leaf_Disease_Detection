import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearAuthSession,
  fetchCurrentUser,
  getAuthToken,
  getStoredUser,
  loginAccount,
  registerAccount,
} from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => getAuthToken())
  const [checking, setChecking] = useState(Boolean(getAuthToken()))

  useEffect(() => {
    const handleAuthCleared = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('leafai-auth-cleared', handleAuthCleared)
    return () => window.removeEventListener('leafai-auth-cleared', handleAuthCleared)
  }, [])

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }

    let alive = true
    ;(async () => {
      try {
        const current = await fetchCurrentUser()
        if (alive) setUser(current)
      } catch {
        if (alive) {
          clearAuthSession()
          setUser(null)
          setToken(null)
        }
      } finally {
        if (alive) setChecking(false)
      }
    })()

    return () => { alive = false }
  }, [token])

  const value = useMemo(() => ({
    user,
    token,
    checking,
    isAuthenticated: Boolean(token && user),
    async login(payload) {
      const data = await loginAccount(payload)
      setUser(data.user)
      setToken(data.access_token)
      return data.user
    },
    async register(payload) {
      const data = await registerAccount(payload)
      setUser(data.user)
      setToken(data.access_token)
      return data.user
    },
    logout() {
      clearAuthSession()
      setUser(null)
      setToken(null)
    },
  }), [checking, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
