import Sidebar from "./Sidebar"
import TopNavbar from "./TopNavbar"
import AudioPlayerBar from "./AudioPlayerBar"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen relative" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Aurora background */}
      <div className="sf-bg-aurora" aria-hidden="true" />
      {/* Grid overlay */}
      <div className="sf-grid-overlay" aria-hidden="true" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopNavbar />

        {/* Scrollable Content */}
        <main className="flex-1 p-6 md:p-8 pb-32 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Persistent Audio Player Bar */}
      <AudioPlayerBar />
    </div>
  )
}
