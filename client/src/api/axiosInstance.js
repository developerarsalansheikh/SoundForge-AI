import axios from "axios"

const axiosInstance = axios.create({
  // In dev: Vite proxy forwards /api → localhost:8080
  // In production: VITE_API_BASE_URL points to Render backend URL
  baseURL: import.meta.env.VITE_API_BASE_URL || "/",
})

// ─── Request Interceptor — attach Bearer token to OUR backend calls only ─────
axiosInstance.interceptors.request.use(
  (config) => {
    // Only attach the JWT for requests to our own backend (relative URLs or same origin).
    // External URLs (e.g. https://api.sunoapi.org) must NOT get our user's JWT.
    const isExternal =
      config.url && (config.url.startsWith("http://") || config.url.startsWith("https://"))

    if (!isExternal) {
      const saved = localStorage.getItem("user")
      if (saved) {
        try {
          const { token } = JSON.parse(saved)
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch {
          // Corrupted storage — ignore, let 401 interceptor handle cleanup
        }
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — handle 401 globally ──────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale/expired session
      localStorage.removeItem("user")
      // Hard redirect to login — works even outside React component tree
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
