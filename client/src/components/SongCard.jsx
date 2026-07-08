import { useState } from "react"
import {
  Play, Pause, Heart, Trash2, Download, Copy,
  ExternalLink, MoreVertical, Disc, Clock, Calendar, Loader2,
} from "lucide-react"
import { usePlayer } from "../context/PlayerContext"
import { toggleFavorite } from "../api/songs"
import { toast } from "react-hot-toast"
import { Link } from "react-router-dom"

export default function SongCard({ song, onDeleteRequested }) {
  const { currentSong, isPlaying, toggle, isLoading, isBuffering } = usePlayer()
  const [isFav, setIsFav]       = useState(song.isFavorite)
  const [showMenu, setShowMenu] = useState(false)

  const isCurrent    = currentSong?._id === song._id || currentSong?.id === song.id
  const activePlaying = isCurrent && isPlaying
  const activeLoading = isCurrent && (isLoading || isBuffering)

  const handleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation()
    try {
      const res = await toggleFavorite(song._id)
      setIsFav(res.isFavorite)
      toast.success(res.isFavorite ? "Added to favorites ❤️" : "Removed from favorites")
    } catch {
      toast.error("Failed to update favorite")
    }
  }

  const handleCopyLink = (e) => {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(song.cloudinaryUrl)
    toast.success("Link copied!")
    setShowMenu(false)
  }

  const handleCopyPrompt = (e) => {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(song.prompt)
    toast.success("Prompt copied!")
    setShowMenu(false)
  }

  const handleDownload = (e) => {
    e.stopPropagation()
    window.open(`/api/songs/${song._id}/download`, "_blank")
    setShowMenu(false)
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""

  const formatDuration = (sec) => {
    if (!sec) return ""
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div
      onClick={() => toggle(song)}
      className="sf-card-interactive flex flex-col h-full relative group"
    >
      {/* Cover art */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-t-[1.25rem]"
        style={{ backgroundColor: "var(--bg-elevated)" }}
      >
        {song.coverImageUrl ? (
          <img
            src={song.coverImageUrl}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))" }}
          >
            <Disc
              className="w-12 h-12 animate-spin-slow"
              style={{ color: "rgba(124,58,237,0.4)" }}
            />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl"
            style={{ background: "#fff", color: "#0f0f1a" }}
          >
            {activeLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            ) : activePlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play  className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Duration badge */}
        {song.duration && (
          <div
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono backdrop-blur-md border"
            style={{
              background: "rgba(0,0,0,0.65)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            <Clock className="w-2.5 h-2.5" style={{ color: "var(--brand-light)" }} />
            {formatDuration(song.duration)}
          </div>
        )}

        {/* EQ bars when playing */}
        {activePlaying && (
          <div
            className="absolute bottom-2.5 left-2.5 flex items-end gap-[2px] h-5 px-2 py-1 rounded-md backdrop-blur-md border"
            style={{
              background: "rgba(124,58,237,0.25)",
              borderColor: "rgba(124,58,237,0.3)",
            }}
          >
            <span className="eq-bar" />
            <span className="eq-bar" />
            <span className="eq-bar" />
            <span className="eq-bar" />
            <span className="eq-bar" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title + menu */}
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/songs/${song._id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-display font-bold text-sm leading-tight hover:underline flex-1 line-clamp-2"
            style={{ color: "var(--text-primary)" }}
          >
            {song.title}
          </Link>

          {/* Context menu */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu((v) => !v) }}
              className="sf-btn-icon w-7 h-7"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}
                />
                <div className="sf-dropdown absolute right-0 top-8 w-44 z-50 animate-scale-in py-1">
                  <button onClick={handleCopyLink}   className="sf-dropdown-item w-full">
                    <Copy className="w-3.5 h-3.5" /><span>Copy Link</span>
                  </button>
                  <button onClick={handleCopyPrompt} className="sf-dropdown-item w-full">
                    <Copy className="w-3.5 h-3.5" /><span>Copy Prompt</span>
                  </button>
                  <button onClick={handleDownload}   className="sf-dropdown-item w-full">
                    <Download className="w-3.5 h-3.5" /><span>Download MP3</span>
                  </button>
                  <div className="border-t my-1" style={{ borderColor: "var(--border-subtle)" }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteRequested(song); setShowMenu(false) }}
                    className="sf-dropdown-item danger w-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" /><span>Delete Song</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Prompt preview */}
        <p
          className="text-xs line-clamp-2 leading-relaxed italic flex-1"
          style={{ color: "var(--text-muted)" }}
        >
          "{song.prompt}"
        </p>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {/* Style badge */}
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md max-w-[110px] truncate"
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            {song.style || "General"}
          </span>

          {/* Date */}
          <span
            className="flex items-center gap-1 text-[9px] font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            <Calendar className="w-2.5 h-2.5" style={{ color: "var(--brand)" }} />
            {formatDate(song.createdAt)}
          </span>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleFavorite}
            className="sf-btn-icon w-8 h-8"
            style={isFav ? { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" } : {}}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
          </button>

          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(e) }}
              className="sf-btn-icon w-8 h-8"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <Link
              to={`/songs/${song._id}`}
              onClick={(e) => e.stopPropagation()}
              className="sf-btn-icon w-8 h-8"
              title="Details"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
