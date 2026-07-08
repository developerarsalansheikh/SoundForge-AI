import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Music2, LayoutDashboard, Library, Settings, LogOut, Disc, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const links = [
  { to: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { to: "/generate",  label: "Compose AI",  icon: Music2 },
  { to: "/library",   label: "My Library",  icon: Library },
  { to: "/settings",  label: "Settings",    icon: Settings },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const initial = user?.name ? user.name[0].toUpperCase() : "U"

  return (
    <aside
      className={`sf-sidebar h-screen sticky top-0 flex flex-col justify-between z-30 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      {/* Top section */}
      <div className="flex flex-col gap-6 p-4 flex-1 min-h-0">
        {/* Logo + Collapse Toggle row */}
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0 animate-fade-in">
              {/* Logo icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--brand), var(--accent))",
                  boxShadow: "0 4px 16px var(--brand-glow)",
                }}
              >
                <Disc className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <span
                  className="font-display font-extrabold text-sm tracking-tight block sf-gradient-text"
                >
                  SoundForge
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.15em] block"
                  style={{ color: "var(--text-muted)" }}
                >
                  AI Studio
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto"
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--accent))",
                boxShadow: "0 4px 16px var(--brand-glow)",
              }}
            >
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="sf-btn-icon w-8 h-8 shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="sf-btn-icon w-8 h-8 mx-auto"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {!collapsed && (
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Navigation
            </span>
          )}

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sf-nav-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`
              }
              title={collapsed ? link.label : undefined}
            >
              <link.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in text-xs">{link.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-3 animate-fade-in">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)" }}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className="block text-xs font-bold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {user?.name || "Artist"}
              </span>
              <span
                className="block text-[10px] truncate font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {user?.email}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)" }}
          >
            {initial}
          </div>
        )}

        <button
          onClick={logout}
          className={`sf-nav-link w-full text-left transition-all ${
            collapsed ? "justify-center px-0" : ""
          }`}
          style={{ color: "var(--danger)" }}
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span className="text-xs animate-fade-in">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
