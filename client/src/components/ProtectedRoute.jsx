import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
 * Renders a full-screen loading spinner while the auth session is being
 * restored from localStorage / verified with the backend.
 * Once resolved:
 *  - Authenticated  → renders children
 *  - Unauthenticated → redirects to /login
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Animated loading indicator that matches the app's design system */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-foreground/50 text-sm tracking-widest uppercase font-mono animate-pulse">
            Restoring session...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
