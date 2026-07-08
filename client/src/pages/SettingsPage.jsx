
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye, EyeOff, Key, Save, Trash2, Loader2,
  CheckCircle2, AlertCircle, Shield, ExternalLink,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../api/axiosInstance"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
  const [apiKey,       setApiKey]       = useState("")
  const [originalKey,  setOriginalKey]  = useState("")
  const [showKey,      setShowKey]      = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [deleting,     setDeleting]     = useState(false)

  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return }
    axiosInstance.get("/api/user/api-key")
      .then((res) => {
        if (res.data.success) {
          const k = res.data.sunoApiKey || ""
          setApiKey(k); setOriginalKey(k)
        }
      })
      .catch((err) => toast.error(err.response?.data?.error || "Failed to load API key"))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const handleSave = async () => {
    if (!apiKey.trim()) { toast.error("API Key cannot be empty."); return }
    setSaving(true)
    try {
      const res = await axiosInstance.post("/api/user/api-key", { sunoApiKey: apiKey })
      if (res.data.success) { setOriginalKey(apiKey); toast.success("API key saved!") }
    } catch (err) { toast.error(err.response?.data?.error || "Failed to save key.") }
    finally { setSaving(false) }
  }

  const handleUpdate = async () => {
    if (!apiKey.trim()) { toast.error("API Key cannot be empty."); return }
    setSaving(true)
    try {
      const res = await axiosInstance.put("/api/user/api-key", { sunoApiKey: apiKey })
      if (res.data.success) { setOriginalKey(apiKey); toast.success("API key updated!") }
    } catch (err) { toast.error(err.response?.data?.error || "Failed to update key.") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your Suno API key?")) return
    setDeleting(true)
    try {
      const res = await axiosInstance.delete("/api/user/api-key")
      if (res.data.success) { setApiKey(""); setOriginalKey(""); toast.success("API key deleted.") }
    } catch (err) { toast.error(err.response?.data?.error || "Failed to delete key.") }
    finally { setDeleting(false) }
  }

  const keyChanged = apiKey !== originalKey

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h2 className="font-display font-extrabold text-xl" style={{ color: "var(--text-primary)" }}>
          API Settings
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Manage your Suno API credentials
        </p>
      </div>

      {/* Account card */}
      <div className="sf-card p-5 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0"
          style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))" }}
        >
          {user?.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
          <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
        </div>
        {originalKey && (
          <span className="ml-auto sf-badge sf-badge-success shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5" /> Connected
          </span>
        )}
      </div>

      {/* API Key Card */}
      <div className="sf-card p-6 space-y-5">
        {/* Card header */}
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))", boxShadow: "0 4px 16px var(--brand-glow)" }}
          >
            <Key className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Suno API Key
            </h3>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Required for AI music generation
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
            <p className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
              Loading settings...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Info notice */}
            <div
              className="p-3.5 rounded-xl flex items-start gap-3 text-xs leading-relaxed"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "var(--brand-light)" }}
            >
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Your API key is encrypted and stored securely. It's only used when you generate music.{" "}
                <a
                  href="https://suno.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold inline-flex items-center gap-0.5"
                >
                  Get your key at suno.com <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            {/* Key input */}
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Personal Suno API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="sf-input pr-12 font-mono text-sm tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {apiKey && (
                <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {apiKey.length} characters · {showKey ? apiKey : `${apiKey.substring(0, 6)}${"•".repeat(Math.max(0, apiKey.length - 6))}`}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div
              className="flex flex-wrap items-center gap-3 pt-4 border-t"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {originalKey ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={saving || deleting || !keyChanged}
                    className="sf-btn-primary flex-1 disabled:opacity-40 disabled:transform-none"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Update Key</>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    className="sf-btn-danger"
                  >
                    {deleting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Delete</>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving || !apiKey.trim()}
                  className="sf-btn-primary w-full disabled:opacity-40 disabled:transform-none"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Key</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="sf-card p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Resources
        </p>
        {[
          { label: "Suno AI Platform",       href: "https://suno.com" },
          { label: "API Documentation",      href: "https://suno.com/blog/api" },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="sf-dropdown-item w-full rounded-lg"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
