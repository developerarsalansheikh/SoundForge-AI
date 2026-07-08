import { Trash2, X, AlertTriangle } from "lucide-react"

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, songTitle }) {
  if (!isOpen) return null

  return (
    <div className="sf-modal-backdrop" onClick={onClose}>
      <div
        className="sf-modal w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 flex items-start gap-4 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: "var(--danger)" }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
              Delete Song Permanently
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--text-primary)" }}>"{songTitle}"</strong>?
              This will permanently erase the audio from Cloudinary and all database records.
              This action is <strong style={{ color: "var(--danger)" }}>irreversible</strong>.
            </p>
          </div>

          <button
            onClick={onClose}
            className="sf-btn-icon w-8 h-8 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div
          className="p-5 flex items-center justify-end gap-3"
          style={{ background: "rgba(0,0,0,0.05)" }}
        >
          <button onClick={onClose} className="sf-btn-secondary py-2.5 px-5 text-xs">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="sf-btn-danger flex items-center gap-2 py-2.5 px-5 text-xs"
            style={{
              background: "var(--danger)",
              color: "#fff",
              borderColor: "var(--danger)",
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  )
}
