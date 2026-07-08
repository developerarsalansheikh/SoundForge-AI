import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Disc, Eye, EyeOff, Loader2 } from "lucide-react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

export default function LoginPage() {
  const [email,        setEmail]        = useState("")
  const [password,     setPassword]     = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState("")
  const [loading,      setLoading]      = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true)
    try {
      const res = await axios.post("/api/auth/login", { email, password })
      login(res.data)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Aurora background */}
      <div className="sf-bg-aurora" />
      <div className="sf-grid-overlay" />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="sf-card p-8 space-y-6">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--accent))",
                boxShadow: "0 8px 32px var(--brand-glow)",
              }}
            >
              <Disc className="w-7 h-7 text-white animate-spin-slow" />
            </div>
            <div className="text-center">
              <h1 className="font-display font-extrabold text-2xl sf-gradient-text">
                SoundForge
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                AI Studio
              </p>
            </div>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              Sign in to your creative workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="sf-input"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="sf-input pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="p-3 rounded-xl text-xs font-medium"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="sf-btn-primary w-full py-3.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold underline"
              style={{ color: "var(--brand-light)" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
