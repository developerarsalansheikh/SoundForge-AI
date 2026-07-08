import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Disc, Eye, EyeOff, Loader2 } from "lucide-react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

export default function RegisterPage() {
  const [name,                 setName]                 = useState("")
  const [email,                setEmail]                = useState("")
  const [phone,                setPhone]                = useState("")
  const [password,             setPassword]             = useState("")
  const [confirmPassword,      setConfirmPassword]      = useState("")
  const [showPassword,         setShowPassword]         = useState(false)
  const [showConfirmPassword,  setShowConfirmPassword]  = useState(false)
  const [error,                setError]                = useState("")
  const [loading,              setLoading]              = useState(false)

  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("All fields are required."); return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match."); return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit Indian mobile number."); return
    }
    setLoading(true)
    try {
      const res = await axios.post("/api/auth/register", { name, email, phone: phone.trim(), password })
      register(res.data)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: "Full Name",            type: "text",     value: name,            set: setName,            placeholder: "Your full name",      autoComplete: "name" },
    { label: "Email Address",        type: "email",    value: email,           set: setEmail,           placeholder: "you@example.com",     autoComplete: "email" },
    { label: "Phone (10 digits)",    type: "tel",      value: phone,           set: setPhone,           placeholder: "9876543210",          autoComplete: "tel",   maxLength: 10 },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="sf-bg-aurora" />
      <div className="sf-grid-overlay" />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
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
                Join SoundForge
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                AI Studio
              </p>
            </div>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              Start creating AI-powered music today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Standard fields */}
            {fields.map((f) => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  maxLength={f.maxLength}
                  autoComplete={f.autoComplete}
                  className="sf-input"
                />
              </div>
            ))}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="sf-input pr-12"
                  autoComplete="new-password"
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

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="sf-input pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-bold underline" style={{ color: "var(--brand-light)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
