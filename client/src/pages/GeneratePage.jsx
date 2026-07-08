import { useState, useRef, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import {
  Music2, AlertCircle, Sparkles, ChevronDown, ChevronUp,
  Play, Pause, Download, Copy, Share2, Disc, Library,
  Sliders, Loader2, CheckCircle2,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { usePlayer } from "../context/PlayerContext"
import axiosInstance from "../api/axiosInstance"
import { toast } from "react-hot-toast"

const POLL_INTERVAL_MS  = 4000
const POLL_CB_MS        = 6000
const POLL_MAX_ATTEMPTS = 45

const GENRES = [
  { name: "Lofi Hip Hop",       desc: "Chill study beats",       icon: "☕" },
  { name: "Synthwave",          desc: "Retro 80s futuristic",    icon: "🕹️" },
  { name: "Modern Trap",        desc: "Heavy bass & hats",       icon: "🔥" },
  { name: "Acoustic Folk",      desc: "Warm guitars & vocals",   icon: "🎸" },
  { name: "Ambient Cinematic",  desc: "Atmospheric textures",    icon: "🌌" },
  { name: "Classic Jazz",       desc: "Smooth piano chords",     icon: "🎷" },
]

const STATUS_MESSAGES = [
  "Initiating SoundForge Engine...",
  "Submitting composition request...",
  "Composing lyric patterns...",
  "Synthesizing audio channels...",
  "Polishing high-fidelity details...",
  "Finalizing Cloudinary master file...",
]

export default function GeneratePage() {
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { toggle, currentSong, isPlaying } = usePlayer()

  const [prompt,                setPrompt]                = useState(searchParams.get("prompt") || "")
  const [style,                 setStyle]                 = useState(searchParams.get("style")  || "Lofi Hip Hop")
  const [title,                 setTitle]                 = useState("")
  const [instrumental,          setInstrumental]          = useState(false)
  const [model,                 setModel]                 = useState("V4_5ALL")
  const [vocalGender,           setVocalGender]           = useState("m")
  const [styleWeight,           setStyleWeight]           = useState(0.65)
  const [weirdnessConstraint,   setWeirdnessConstraint]   = useState(0.65)
  const [showAdvanced,          setShowAdvanced]          = useState(false)
  const [loading,               setLoading]               = useState(false)
  const [statusIdx,             setStatusIdx]             = useState(0)
  const [errorMsg,              setErrorMsg]              = useState("")
  const [resultSong,            setResultSong]            = useState(null)

  const pollRef     = useRef(null)
  const attemptsRef = useRef(0)

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    attemptsRef.current = 0
  }
  useEffect(() => () => stopPolling(), [])

  const startPolling = (taskId, ms = POLL_INTERVAL_MS) => {
    attemptsRef.current = 0
    pollRef.current = setInterval(async () => {
      attemptsRef.current++
      if (attemptsRef.current > POLL_MAX_ATTEMPTS) {
        setErrorMsg("Composing timed out. Completed songs are saved in My Library.")
        setLoading(false); stopPolling(); return
      }
      // Update status message
      const idx = Math.min(Math.floor(attemptsRef.current / 8), STATUS_MESSAGES.length - 1)
      setStatusIdx(idx)

      try {
        const res = await axiosInstance.get(`/api/music/status/${taskId}`)
        if (!res.data.success) { setErrorMsg(res.data.error || "Status polling failed."); setLoading(false); stopPolling(); return }
        const d = res.data
        if (d.done && d.audioUrl) {
          stopPolling()
          setResultSong({ _id: d.songId, title: d.title || title || "Untitled Masterpiece", prompt, style, model, duration: d.duration, cloudinaryUrl: d.audioUrl, coverImageUrl: d.imageUrl, lyrics: d.lyrics })
          setLoading(false); setStatusIdx(0)
          toast.success("🎵 Your song is ready!")
        } else if (d.done && d.status === "error") {
          setErrorMsg(d.error || "Generation failed on Suno side."); setLoading(false); stopPolling()
        }
      } catch (err) { console.error("Poll error:", err) }
    }, ms)
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) { setErrorMsg("Please describe your song idea first."); return }
    setResultSong(null); setErrorMsg(""); setLoading(true); setStatusIdx(0)
    try {
      const res = await axiosInstance.post("/api/music/generate", {
        prompt: prompt.trim(), style: style.trim(),
        title: title.trim() || "Untitled Masterpiece",
        instrumental, model, vocalGender,
        styleWeight: parseFloat(styleWeight),
        weirdnessConstraint: parseFloat(weirdnessConstraint),
        audioWeight: 0.65,
      })
      if (!res.data.success || !res.data.taskId) { setErrorMsg(res.data.error || "No task returned."); setLoading(false); return }
      const ms = res.data.mode === "callback" ? POLL_CB_MS : POLL_INTERVAL_MS
      startPolling(res.data.taskId, ms)
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || "Failed to submit request.")
      setLoading(false)
    }
  }

  const formatDuration = (sec) => {
    if (!sec) return ""
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: Composer form ── */}
        <div
          className="lg:col-span-7 sf-card p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: "var(--brand)" }}
          />

          {/* Header */}
          <div className="relative z-10">
            <h2
              className="font-display font-extrabold text-xl tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Compose a Track
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Powered by Suno V4.5 · Cloudinary permanent storage
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5 relative z-10">
            {/* Prompt */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Song vibe / description
                </label>
                <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {prompt.length}/3000
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.substring(0, 3000))}
                placeholder="e.g. Chill coffee shop piano, lo-fi drum beats, soft soothing melody, late night rain vibe..."
                className="sf-input h-28 resize-none leading-relaxed text-sm"
                disabled={loading}
              />
            </div>

            {/* Genre cards */}
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Genre Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {GENRES.map((g) => {
                  const active = style === g.name
                  return (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => !loading && setStyle(g.name)}
                      className="p-3 rounded-xl border text-left transition-all duration-200"
                      style={{
                        background: active ? "rgba(124,58,237,0.15)" : "var(--input-bg)",
                        borderColor: active ? "var(--brand)" : "var(--border-default)",
                        boxShadow: active ? "0 0 0 1px var(--brand)" : "none",
                      }}
                    >
                      <span className="text-lg block mb-0.5">{g.icon}</span>
                      <span
                        className="block text-xs font-bold truncate"
                        style={{ color: active ? "var(--brand-light)" : "var(--text-primary)" }}
                      >
                        {g.name}
                      </span>
                      <span className="block text-[9px]" style={{ color: "var(--text-muted)" }}>
                        {g.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title + Instrumental */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Track Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Midnight Lullaby"
                  className="sf-input text-sm"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Instrumental Mode
                </label>
                <button
                  type="button"
                  onClick={() => !loading && setInstrumental((v) => !v)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border transition-all"
                  style={{
                    background: "var(--input-bg)",
                    borderColor: instrumental ? "var(--brand)" : "var(--border-default)",
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    No Vocals
                  </span>
                  {/* Toggle pill */}
                  <div
                    className="relative w-10 h-5 rounded-full transition-colors duration-300"
                    style={{ background: instrumental ? "var(--brand)" : "var(--border-default)" }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
                      style={{ transform: instrumental ? "translateX(22px)" : "translateX(2px)" }}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Advanced accordion */}
            <div
              className="border-t pt-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center justify-between w-full transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Sliders className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
                  Advanced Parameters
                </span>
                {showAdvanced
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />
                }
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-fade-in">
                  {/* Model */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      AI Model
                    </label>
                    <select value={model} onChange={(e) => setModel(e.target.value)} className="sf-input text-xs" disabled={loading}>
                      <option value="V4_5ALL">Chirp V4.5-all (Best)</option>
                      <option value="V4_5">Chirp V4.5</option>
                      <option value="V4">Chirp V4 (Standard)</option>
                    </select>
                  </div>

                  {/* Vocal gender */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      Vocal Gender
                    </label>
                    <div className="flex gap-4 pt-2">
                      {[["m", "Male"], ["f", "Female"]].map(([val, lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                          <input
                            type="radio"
                            name="vocalGender"
                            value={val}
                            checked={vocalGender === val}
                            onChange={() => setVocalGender(val)}
                            disabled={loading}
                            style={{ accentColor: "var(--brand)" }}
                          />
                          {lbl}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Style weight */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
                      <span>Style Guidance</span>
                      <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{styleWeight}</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.05" value={styleWeight} onChange={(e) => setStyleWeight(e.target.value)} disabled={loading} />
                  </div>

                  {/* Weirdness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
                      <span>Creative Deviation</span>
                      <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{weirdnessConstraint}</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.05" value={weirdnessConstraint} onChange={(e) => setWeirdnessConstraint(e.target.value)} disabled={loading} />
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {errorMsg && (
              <div
                className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-medium"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p>{errorMsg}</p>
                  {errorMsg.toLowerCase().includes("api key") && (
                    <Link to="/settings" className="block mt-1 font-bold underline" style={{ color: "var(--brand-light)" }}>
                      Add API Key in Settings →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="sf-btn-primary w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Track...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create AI Masterpiece</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── RIGHT: Status / Result ── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Loading state */}
          {loading && (
            <div className="sf-card p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-72">
              {/* Spinner rings */}
              <div className="relative w-20 h-20">
                <div
                  className="absolute inset-0 rounded-full border-4 animate-spin"
                  style={{ borderColor: "rgba(124,58,237,0.2)", borderTopColor: "var(--brand)" }}
                />
                <div
                  className="absolute inset-2 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(6,182,212,0.15)", borderTopColor: "var(--accent)", animationDirection: "reverse", animationDuration: "1.5s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Disc className="w-7 h-7 animate-spin-slow" style={{ color: "var(--accent)" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                  Composing Your Track
                </h4>
                <p
                  className="text-xs font-mono uppercase tracking-wider animate-pulse"
                  style={{ color: "var(--brand-light)" }}
                >
                  {STATUS_MESSAGES[statusIdx]}
                </p>
              </div>

              <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
                Estimated wait: 2–4 minutes. Completed songs are permanently saved.
              </p>
            </div>
          )}

          {/* Idle: composer guide */}
          {!loading && !resultSong && (
            <div className="sf-card p-8 flex flex-col items-center justify-center text-center gap-5 min-h-72">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <Music2 className="w-8 h-8" style={{ color: "var(--brand)" }} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                  Composer Workspace
                </h4>
                <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--text-secondary)" }}>
                  Describe your vibe, pick a genre, then hit <strong>Create AI Masterpiece</strong>. SoundForge will compose, master, and save it to Cloudinary.
                </p>
              </div>
            </div>
          )}

          {/* Success result card */}
          {resultSong && (
            <div
              className="sf-card p-5 space-y-4 animate-fade-in border"
              style={{ borderColor: "rgba(34,197,94,0.2)" }}
            >
              {/* Cover + info */}
              <div className="flex items-center gap-4">
                <div
                  className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  {resultSong.coverImageUrl ? (
                    <img src={resultSong.coverImageUrl} alt={resultSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.1))" }}
                    >
                      <Music2 className="w-8 h-8" style={{ color: "var(--success)" }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <span
                    className="sf-badge sf-badge-success text-[9px]"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" /> Finished Master
                  </span>
                  <h4
                    className="font-display font-bold text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {resultSong.title}
                  </h4>
                  <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    {resultSong.style}
                    {resultSong.duration ? ` · ${formatDuration(resultSong.duration)}` : ""}
                  </p>
                </div>
              </div>

              {/* Waveform viz */}
              <div
                className="flex items-center justify-between gap-1 h-12 px-4 rounded-xl border"
                style={{ background: "var(--input-bg)", borderColor: "var(--border-subtle)" }}
              >
                {[...Array(28)].map((_, i) => {
                  const heights = [6,12,10,4,16,18,8,14,20,12,6,16,14,8,22,10,6,12,18,8,4,14,10,6,8,14,10,6]
                  const h = heights[i % heights.length]
                  const isActive = isPlaying && currentSong?._id === resultSong._id
                  return (
                    <span
                      key={i}
                      className="waveform-bar"
                      style={{
                        height: `${isActive ? h : 4}px`,
                        opacity: isActive ? 0.8 : 0.35,
                        animation: isActive ? `eq-bounce 1s ease-in-out ${i * 0.04}s infinite` : "none",
                      }}
                    />
                  )
                })}
              </div>

              {/* Play button */}
              <button
                onClick={() => toggle(resultSong)}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                style={{
                  background: isPlaying && currentSong?._id === resultSong._id
                    ? "var(--input-bg)"
                    : "#fff",
                  color: "#0f0f1a",
                  border: "1px solid var(--border-default)",
                }}
              >
                {isPlaying && currentSong?._id === resultSong._id ? (
                  <><Pause className="w-4 h-4 fill-current" /><span>Pause</span></>
                ) : (
                  <><Play className="w-4 h-4 fill-current translate-x-px" /><span>Play Master</span></>
                )}
              </button>

              {/* Action grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                {[
                  { label: "Copy Link",     icon: <Share2 className="w-3.5 h-3.5" />,    action: () => { navigator.clipboard.writeText(resultSong.cloudinaryUrl); toast.success("Link copied!") } },
                  { label: "Copy Prompt",   icon: <Copy className="w-3.5 h-3.5" />,      action: () => { navigator.clipboard.writeText(resultSong.prompt); toast.success("Prompt copied!") } },
                  { label: "Download MP3",  icon: <Download className="w-3.5 h-3.5" />,  action: null, href: `/api/songs/${resultSong._id}/download` },
                  { label: "Open Library",  icon: <Library className="w-3.5 h-3.5" />,   action: null, to: "/library" },
                ].map((btn) => (
                  btn.href ? (
                    <a
                      key={btn.label}
                      href={btn.href}
                      className="sf-btn-secondary py-2.5 text-[10px] justify-center"
                    >
                      {btn.icon}<span>{btn.label}</span>
                    </a>
                  ) : btn.to ? (
                    <Link
                      key={btn.label}
                      to={btn.to}
                      className="sf-btn-secondary py-2.5 text-[10px] justify-center flex items-center gap-2"
                    >
                      {btn.icon}<span>{btn.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className="sf-btn-secondary py-2.5 text-[10px] justify-center"
                    >
                      {btn.icon}<span>{btn.label}</span>
                    </button>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
