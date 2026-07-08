import { usePlayer } from "../context/PlayerContext"
import {
  Play, Pause, Volume2, VolumeX, SkipForward, SkipBack,
  Download, Disc, X, ExternalLink, Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function AudioPlayerBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    duration,
    currentTime,
    toggle,
    seek,
    setVolume,
    clearSong,
    isLoading,
    isBuffering,
    error,
  } = usePlayer()

  if (!currentSong) return null

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00"
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="sf-player fixed bottom-0 left-0 right-0 z-40 animate-fade-in"
      style={{ height: "80px" }}
    >
      {/* Progress line at top */}
      <div
        className="absolute top-0 left-0 h-[2px] transition-all duration-300"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--brand), var(--accent))",
          boxShadow: "0 0 8px var(--brand-glow)",
        }}
      />

      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          {currentSong.coverImageUrl ? (
            <img
              src={currentSong.coverImageUrl}
              alt={currentSong.title}
              className="w-11 h-11 rounded-xl object-cover border flex-shrink-0"
              style={{ borderColor: "var(--border-default)" }}
            />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))", borderColor: "var(--border-default)" }}
            >
              <Disc className="w-5 h-5 animate-spin-slow" style={{ color: "var(--brand)" }} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <Link
              to={`/songs/${currentSong._id}`}
              className="block text-xs font-bold truncate hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {currentSong.title}
            </Link>
            {error ? (
              <span className="block text-[9px] font-bold text-red-500 truncate" title={error}>
                ⚠️ {error}
              </span>
            ) : (
              <span
                className="block text-[10px] truncate font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {currentSong.style || "AI Generated"}
              </span>
            )}
          </div>
        </div>

        {/* Centre Controls */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              className="transition-opacity disabled:opacity-30"
              style={{ color: "var(--text-muted)" }}
              disabled
            >
              <SkipBack className="w-4.5 h-4.5" />
            </button>

            {/* Main play/pause */}
            <button
              onClick={() => toggle(currentSong)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--accent))",
                boxShadow: "0 4px 16px var(--brand-glow)",
                color: "#fff",
              }}
            >
              {isLoading || isBuffering ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4.5 h-4.5 fill-current" />
              ) : (
                <Play  className="w-4.5 h-4.5 fill-current translate-x-px" />
              )}
            </button>

            <button
              className="transition-opacity disabled:opacity-30"
              style={{ color: "var(--text-muted)" }}
              disabled
            >
              <SkipForward className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Seek bar */}
          <div className="flex items-center gap-2 w-full">
            <span
              className="text-[10px] font-mono w-9 text-right"
              style={{ color: "var(--text-muted)" }}
            >
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1"
              style={{
                background: `linear-gradient(to right, var(--brand) ${progress}%, var(--border-default) ${progress}%)`,
              }}
            />
            <span
              className="text-[10px] font-mono w-9"
              style={{ color: "var(--text-muted)" }}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4">
          {/* Download */}
          <a
            href={`/api/songs/${currentSong._id}/download`}
            target="_blank"
            rel="noreferrer"
            className="sf-btn-icon"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* View details */}
          <Link to={`/songs/${currentSong._id}`} className="sf-btn-icon hidden md:flex" title="View details">
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {volume === 0
                ? <VolumeX className="w-4 h-4" />
                : <Volume2 className="w-4 h-4" />
              }
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>

          {/* Close */}
          {clearSong && (
            <button
              onClick={clearSong}
              className="sf-btn-icon"
              title="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
