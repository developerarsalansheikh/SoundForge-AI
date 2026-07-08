import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Music2, Heart, Sparkles, Plus, Key, ArrowRight,
  Play, Pause, Disc, Calendar, TrendingUp,
} from "lucide-react"
import { getSongStats } from "../api/songs"
import { usePlayer } from "../context/PlayerContext"

export default function DashboardPage() {
  const [stats, setStats]   = useState({ total: 0, favorites: 0, recent: [] })
  const [loading, setLoading] = useState(true)
  const { currentSong, isPlaying, toggle } = usePlayer()

  useEffect(() => {
    getSongStats()
      .then((res) => { if (res.success) setStats(res.stats) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""

  const statCards = [
    {
      label:   "Total Tracks",
      value:   loading ? "—" : stats.total,
      sub:     <Link to="/library" className="hover:underline" style={{ color: "var(--brand)" }}>View library →</Link>,
      icon:    <Music2 className="w-5 h-5" />,
      accent:  "var(--brand)",
      glow:    "var(--brand-glow)",
    },
    {
      label:   "Favorites",
      value:   loading ? "—" : stats.favorites,
      sub:     <Link to="/library?favorites=true" className="hover:underline" style={{ color: "var(--accent)" }}>Filter library →</Link>,
      icon:    <Heart className="w-5 h-5 fill-current" />,
      accent:  "var(--accent)",
      glow:    "var(--accent-glow)",
    },
    {
      label:   "Credits",
      value:   "∞",
      sub:     <span style={{ color: "var(--success)" }}>• API key connected</span>,
      icon:    <Sparkles className="w-5 h-5" />,
      accent:  "var(--success)",
      glow:    "rgba(34,197,94,0.15)",
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <div>
        <h2
          className="font-display font-extrabold text-2xl md:text-3xl tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome back 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Here's your SoundForge studio overview.
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`sf-stat-card stagger-${i + 1} animate-fade-in`}
          >
            {/* Glow blob */}
            <div
              className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-30"
              style={{ background: card.accent, transform: "translate(30%, -30%)" }}
            />

            <div className="space-y-1 relative z-10">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {card.label}
              </span>
              <div
                className="font-display font-extrabold text-3xl"
                style={{ color: "var(--text-primary)" }}
              >
                {card.value}
              </div>
              <div className="text-xs font-medium pt-1">{card.sub}</div>
            </div>

            <div
              className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `rgba(0,0,0,0.08)`,
                border: `1px solid ${card.accent}33`,
                color: card.accent,
                boxShadow: `0 4px 16px ${card.glow}`,
              }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {/* 2-col: Recent tracks + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tracks */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="font-display font-bold text-base flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: "var(--brand)" }} />
              Recent Tracks
            </h3>
            <Link
              to="/library"
              className="flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="sf-skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : stats.recent.length === 0 ? (
            <div
              className="sf-card p-10 text-center space-y-4"
              style={{ borderStyle: "dashed" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border-default)" }}
              >
                <Music2 className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No tracks yet. Compose your first song!
              </p>
              <Link to="/generate" className="sf-btn-primary inline-flex mt-2">
                <Plus className="w-4 h-4" /> Generate Song
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recent.map((song) => {
                const isCurrent     = currentSong?._id === song._id
                const activePlaying = isCurrent && isPlaying
                return (
                  <div
                    key={song._id}
                    onClick={() => toggle(song)}
                    className="sf-card flex items-center justify-between p-3.5 cursor-pointer group transition-all duration-200 hover:border-[var(--brand)]/30"
                    style={{ borderRadius: "0.875rem" }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Thumb */}
                      <div
                        className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden border"
                        style={{ borderColor: "var(--border-subtle)" }}
                      >
                        {song.coverImageUrl ? (
                          <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))" }}
                          >
                            <Disc className="w-4 h-4" style={{ color: "var(--brand)" }} />
                          </div>
                        )}
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "rgba(0,0,0,0.45)" }}
                        >
                          {activePlaying
                            ? <Pause className="w-4 h-4 text-white fill-current" />
                            : <Play  className="w-4 h-4 text-white fill-current translate-x-px" />
                          }
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span
                          className="block text-sm font-bold truncate group-hover:text-[var(--brand-light)] transition"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {song.title}
                        </span>
                        <span
                          className="block text-[10px] font-mono truncate max-w-[220px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {song.style} • {song.prompt}
                        </span>
                      </div>
                    </div>

                    <span
                      className="flex items-center gap-1 text-[10px] font-mono shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Calendar className="w-3 h-3" style={{ color: "var(--brand)" }} />
                      {formatDate(song.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="space-y-4">
          <h3
            className="font-display font-bold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Quick Actions
          </h3>

          <div className="sf-card p-5 space-y-3">
            <Link
              to="/generate"
              className="sf-btn-primary w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Generate Song
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/settings"
              className="sf-btn-secondary w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4" style={{ color: "var(--brand)" }} /> API Key Setup
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Platform info */}
          <div
            className="sf-card p-5 space-y-2 border"
            style={{ borderColor: "rgba(124,58,237,0.15)" }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--brand-light)" }}
            >
              Connected Platform
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Suno V4.5 endpoints. Tracks auto-upload to Cloudinary for permanent storage.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
