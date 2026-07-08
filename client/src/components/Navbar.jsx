import { Music, LogOut, Settings, LogIn, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="glass border-b border-primary/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent neon-glow">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-heading font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SoundForge
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* User Avatar + Info */}
              <div className="flex items-center gap-2 mr-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-foreground/60">{user?.email}</p>
                </div>
              </div>

              {/* Settings */}
              <Link
                to="/settings"
                className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/35 transition-all duration-300 font-semibold flex items-center gap-2 text-sm"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition-all duration-300 font-semibold flex items-center gap-2 text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/35 transition-all duration-300 font-semibold flex items-center gap-2 text-sm"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Login</span>
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-transparent hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 font-semibold flex items-center gap-2 text-sm"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
