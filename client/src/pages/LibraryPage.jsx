import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Search, Filter, SortAsc, Music2, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { getMySongs, deleteSong } from "../api/songs"
import SongCard from "../components/SongCard"
import DeleteConfirmModal from "../components/DeleteConfirmModal"
import { toast } from "react-hot-toast"

const STYLE_FILTERS = ["all", "Lofi Hip Hop", "Synthwave", "Modern Trap", "Acoustic Folk", "Classic Jazz", "Ambient Cinematic"]

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [songs,       setSongs]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, limit: 12, totalPages: 1 })

  const [searchQuery,   setSearchQuery]   = useState(searchParams.get("q")     || "")
  const [selectedStyle, setSelectedStyle] = useState(searchParams.get("style") || "all")
  const [selectedSort,  setSelectedSort]  = useState(searchParams.get("sort")  || "newest")
  const [currentPage,   setCurrentPage]   = useState(parseInt(searchParams.get("page") || "1", 10))
  const favoritesOnly = searchParams.get("favorites") === "true"

  const [songToDelete,       setSongToDelete]       = useState(null)
  const [isDeleteModalOpen,  setIsDeleteModalOpen]  = useState(false)

  const fetchSongs = async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 12, sort: selectedSort, favorites: favoritesOnly }
      if (searchQuery.trim()) params.q = searchQuery.trim()
      if (selectedStyle !== "all") params.style = selectedStyle
      const res = await getMySongs(params)
      if (res.success) { setSongs(res.songs); setPagination(res.pagination) }
    } catch {
      toast.error("Failed to load library")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSongs() }, [currentPage, selectedSort, selectedStyle, searchQuery, favoritesOnly])

  const handleSearchSubmit = (e) => {
    e.preventDefault(); setCurrentPage(1)
    const p = {}
    if (searchQuery.trim())   p.q       = searchQuery.trim()
    if (selectedStyle !== "all") p.style = selectedStyle
    if (selectedSort !== "newest") p.sort = selectedSort
    if (favoritesOnly) p.favorites = "true"
    setSearchParams(p)
  }

  const handleDeleteConfirm = async () => {
    if (!songToDelete) return
    try {
      const res = await deleteSong(songToDelete._id)
      if (res.success) {
        toast.success("Song deleted permanently")
        setSongs((prev) => prev.filter((s) => s._id !== songToDelete._id))
        setIsDeleteModalOpen(false); setSongToDelete(null)
      }
    } catch { toast.error("Failed to delete song") }
  }

  const handlePageChange = (p) => {
    if (p >= 1 && p <= pagination.totalPages) {
      setCurrentPage(p)
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: p })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search / filter bar */}
      <section className="sf-card p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search by title, style, prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sf-input pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Style filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              <select
                value={selectedStyle}
                onChange={(e) => { setSelectedStyle(e.target.value); setCurrentPage(1) }}
                className="sf-input text-xs py-2.5 w-auto"
                style={{ paddingRight: "2.5rem" }}
              >
                {STYLE_FILTERS.map((st) => (
                  <option key={st} value={st}>{st === "all" ? "All Genres" : st}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              <select
                value={selectedSort}
                onChange={(e) => { setSelectedSort(e.target.value); setCurrentPage(1) }}
                className="sf-input text-xs py-2.5 w-auto"
                style={{ paddingRight: "2.5rem" }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
                <option value="duration">Longest Tracks</option>
              </select>
            </div>

            <button type="submit" className="sf-btn-primary py-2.5 px-5">
              Search
            </button>
          </div>
        </form>

        {/* Active filter tags */}
        {(favoritesOnly || selectedStyle !== "all") && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Active:</span>
            {favoritesOnly && <span className="sf-badge sf-badge-primary">Favorites only</span>}
            {selectedStyle !== "all" && <span className="sf-badge sf-badge-primary">{selectedStyle}</span>}
          </div>
        )}
      </section>

      {/* Song grid / loading / empty */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="sf-card overflow-hidden">
              <div className="sf-skeleton aspect-square w-full" style={{ borderRadius: "1.25rem 1.25rem 0 0" }} />
              <div className="p-4 space-y-2.5">
                <div className="sf-skeleton h-4 w-3/4 rounded" />
                <div className="sf-skeleton h-3 w-full rounded" />
                <div className="sf-skeleton h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="sf-card p-16 text-center space-y-4 max-w-md mx-auto">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-default)" }}
          >
            <Music2 className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
          </div>
          <h4 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
            No Tracks Found
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {favoritesOnly
              ? "You haven't favorited any songs yet."
              : "No tracks match your current search. Try composing something new!"}
          </p>
          <Link to="/generate" className="sf-btn-primary inline-flex mt-2">
            <Plus className="w-4 h-4" /> Generate Song
          </Link>
        </div>
      ) : (
        <>
          {/* Track count */}
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            {pagination.total} track{pagination.total !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {songs.map((song, i) => (
              <div
                key={song._id}
                className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
              >
                <SongCard
                  song={song}
                  onDeleteRequested={(s) => { setSongToDelete(s); setIsDeleteModalOpen(true) }}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="sf-btn-icon disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold" style={{ color: "var(--text-muted)" }}>
            Page {pagination.page} / {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="sf-btn-icon disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSongToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        songTitle={songToDelete?.title}
      />
    </div>
  )
}
