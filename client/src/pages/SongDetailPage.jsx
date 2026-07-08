import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Play, Pause, Download, Trash2, Copy, Share2,
  Disc, Calendar, ArrowLeft, RefreshCw, Sparkles, Clock, Loader2,
} from "lucide-react"
import { getSongById, deleteSong } from "../api/songs"
import { usePlayer } from "../context/PlayerContext"
import DeleteConfirmModal from "../components/DeleteConfirmModal"
import { toast } from "react-hot-toast"

export default function SongDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song,             setSong]             = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { currentSong, isPlaying, toggle, isLoading, isBuffering } = usePlayer()
  const isCurrent     = currentSong?._id === id
  const activePlaying = isCurrent && isPlaying
  const activeLoading = isCurrent && (isLoading || isBuffering)

  useEffect(() => {
    getSongById(id)
      .then((res) => { if (res.success) setSong(res.song) })
      .catch((err) => { toast.error("Track not found"); navigate("/library") })
      .finally(() => setLoading(false))
  }, [id])

  const handleDeleteConfirm = async () => {
    try {
      await deleteSong(id)
      toast.success("Song deleted permanently.")
      setIsDeleteModalOpen(false)
      navigate("/library")
    } catch {
      toast.error("Failed to delete song.")
    }
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""

  const formatDuration = (sec) => {
    if (!sec) return ""
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-2 animate-spin"
          style={{ borderColor: "rgba(124,58,237,0.2)", borderTopColor: "var(--brand)" }}
        />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Loading track...
        </span>
      </div>
    )
  }

  if (!song) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cover + controls */}
        <div className="sf-card p-6 flex flex-col items-center text-center gap-5">
          {/* Cover art */}
          <div
            className="relative aspect-square w-full max-w-[260px] rounded-2xl overflow-hidden border"
            style={{ borderColor: "var(--border-default)", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}
          >
            {song.coverImageUrl ? (
              <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))" }}
              >
                <Sparkles className="w-16 h-16 animate-float" style={{ color: "rgba(124,58,237,0.4)" }} />
              </div>
            )}

            {/* Now playing overlay */}
            {(activePlaying || activeLoading) && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                {activeLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <div className="flex items-end gap-1 h-8">
                    {[0,1,2,3,4].map((i) => (
                      <span key={i} className="eq-bar" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title & meta */}
          <div className="space-y-2 w-full">
            <span className="sf-badge sf-badge-primary">{song.style || "General"}</span>
            <h2
              className="font-display font-extrabold text-xl"
              style={{ color: "var(--text-primary)" }}
            >
              {song.title}
            </h2>
            <div className="flex items-center justify-center gap-3 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              <span>{song.model}</span>
              {song.duration && (
                <><span>·</span><span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDuration(song.duration)}</span></>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full space-y-2.5 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
            {/* Play */}
            <button
              onClick={() => toggle(song)}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              style={{ background: "#fff", color: "#0f0f1a" }}
            >
              {activeLoading ? (
                <><Loader2 className="w-4.5 h-4.5 animate-spin" /><span>Loading Track...</span></>
              ) : activePlaying ? (
                <><Pause className="w-4.5 h-4.5 fill-current" /><span>Pause</span></>
              ) : (
                <><Play className="w-4.5 h-4.5 fill-current translate-x-px" /><span>Play Track</span></>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { navigator.clipboard.writeText(song.cloudinaryUrl); toast.success("Link copied!") }} className="sf-btn-secondary py-2.5 text-[10px] justify-center">
                <Share2 className="w-3.5 h-3.5" /> Copy Link
              </button>
              <a href={`/api/songs/${song._id}/download`} className="sf-btn-secondary py-2.5 text-[10px] justify-center flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="sf-btn-danger w-full py-2.5 text-[10px] justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Song
            </button>
          </div>
        </div>

        {/* Right: Prompt + Lyrics + Metadata */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prompt */}
          <div className="sf-card p-5 space-y-4">
            <div
              className="flex items-center justify-between border-b pb-3"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <h4 className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Composition Prompt
              </h4>
              <button
                onClick={() => { navigator.clipboard.writeText(song.prompt); toast.success("Prompt copied!") }}
                className="sf-btn-icon w-7 h-7"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
              "{song.prompt}"
            </p>

            <div
              className="flex items-center justify-between pt-3 border-t text-[10px] font-mono"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" style={{ color: "var(--brand)" }} />
                {formatDate(song.createdAt)}
              </span>
              <button
                onClick={() => navigate(`/generate?prompt=${encodeURIComponent(song.prompt)}&style=${encodeURIComponent(song.style)}`)}
                className="flex items-center gap-1.5 font-bold transition-colors"
                style={{ color: "var(--brand)" }}
              >
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="sf-card p-5">
            <h4 className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              Track Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Genre",    value: song.style    || "—" },
                { label: "Model",    value: song.model    || "—" },
                { label: "Duration", value: formatDuration(song.duration) || "—" },
                { label: "Created",  value: new Date(song.createdAt).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-3 rounded-xl"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)" }}
                >
                  <span className="block text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                  <span className="block text-xs font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lyrics */}
          <div className="sf-card p-5 space-y-3">
            <h4
              className="font-display font-bold text-sm border-b pb-3"
              style={{ color: "var(--text-primary)", borderColor: "var(--border-subtle)" }}
            >
              Lyrics
            </h4>
            {song.lyrics ? (
              <pre
                className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-4 rounded-xl max-h-72 overflow-y-auto"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                {song.lyrics}
              </pre>
            ) : (
              <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                Instrumental track — no lyrics were generated.
              </p>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        songTitle={song.title}
      />
    </div>
  )
}
