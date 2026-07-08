import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import { Toaster } from "react-hot-toast"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardLayout from "./components/DashboardLayout"

// Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import SettingsPage from "./pages/SettingsPage"
import DashboardPage from "./pages/DashboardPage"
import GeneratePage from "./pages/GeneratePage"
import LibraryPage from "./pages/LibraryPage"
import SongDetailPage from "./pages/SongDetailPage"

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <main
      className="min-h-screen relative"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Routes>
        {/* Public Routes — redirect to dashboard if logged in */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />

        {/* Root Page — Show Landing page if guest, redirect to Dashboard if auth */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />

        {/* Dashboard Layout Protected Sub-routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <GeneratePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LibraryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/songs/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SongDetailPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            backdropFilter: "blur(12px)",
            fontSize: "0.8125rem",
            fontWeight: "600",
            borderRadius: "0.875rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          },
          success: {
            iconTheme: { primary: "var(--success)", secondary: "var(--bg-elevated)" },
          },
          error: {
            iconTheme: { primary: "var(--danger)", secondary: "var(--bg-elevated)" },
          },
        }}
      />
    </main>
  )
}

export default App
