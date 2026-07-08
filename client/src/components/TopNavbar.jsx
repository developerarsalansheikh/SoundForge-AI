import { useState, useRef, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { Bell, Sparkles, Sun, Moon, ChevronDown, LogOut, Settings, User } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"

const PAGE_TITLES = {
  "/dashboard": { title: "Studio Dashboard",      sub: "Overview & recent tracks" },
  "/generate":  { title: "AI Music Generator",    sub: "Compose with AI" },
  "/library":   { title: "My Songs Library",      sub: "All your generated tracks" },
  "/settings":  { title: "API Settings",          sub: "Configure Suno & integrations" },
}

export default function TopNavbar() {
  const location = useLocation()
  const { theme, toggleTheme, isDark } = useTheme()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const page = PAGE_TITLES[location.pathname] || {
    title: "SoundForge AI Studio",
    sub: location.pathname.startsWith("/songs/") ? "Track details" : "",
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const initial = user?.name ? user.name[0].toUpperCase() : "U"

  return (
    <header
      className="sf-navbar h-16 px-6 md:px-8 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Page title */}
      <div>
        <h1
          className="font-display font-bold text-base leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {page.title}
        </h1>
        {page.sub && (
          <p
            className="text-[10px] font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {page.sub}
          </p>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Credits badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider sf-badge sf-badge-primary"
        >
          <Sparkles className="w-3 h-3" />
          <span>Unlimited</span>
        </div>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={toggleTheme}
          className="sf-btn-icon"
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4" style={{ color: "#fbbf24" }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: "var(--brand)" }} />
          )}
        </button>

        {/* Notifications */}
        <button className="sf-btn-icon relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
            style={{
              backgroundColor: "var(--accent)",
              borderColor: "var(--bg-base)",
            }}
          />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-3 ml-1 border-l"
            style={{ borderColor: "var(--border-default)" }}
            aria-label="Profile menu"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs"
              style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))" }}
            >
              {initial}
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              style={{ color: "var(--text-muted)" }}
            />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div
                className="sf-dropdown absolute right-0 top-12 w-52 z-50 animate-scale-in py-1.5"
              >
                {/* User header */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                    {user?.name || "Artist"}
                  </p>
                  <p className="text-[10px] font-mono truncate" style={{ color: "var(--text-muted)" }}>
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="sf-dropdown-item"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={() => { logout(); setProfileOpen(false) }}
                  className="sf-dropdown-item danger w-full text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
