import { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ─── Restore & verify session on mount ──────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const saved = localStorage.getItem("user")
      if (!saved) {
        setLoading(false)
        return
      }

      let parsed
      try {
        parsed = JSON.parse(saved)
      } catch {
        localStorage.removeItem("user")
        setLoading(false)
        return
      }

      // Verify token is still valid with the backend
      try {
        await axios.post(
          "/api/auth/private",
          {},
          { headers: { Authorization: `Bearer ${parsed.token}` } }
        )
        // Token is valid — restore user
        setUser(parsed)
      } catch (err) {
        // Token expired or invalid — clear storage
        localStorage.removeItem("user")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ─── login ───────────────────────────────────────────────────────────────────
  const login = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }, [])

  // ─── register ────────────────────────────────────────────────────────────────
  const register = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }, [])

  // ─── logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("user")
    setUser(null)
  }, [])

  // ─── getCurrentUser ───────────────────────────────────────────────────────────
  const getCurrentUser = useCallback(() => user, [user])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    getCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>")
  }
  return context
}
