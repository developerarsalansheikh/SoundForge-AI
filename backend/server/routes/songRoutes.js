const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getMySongs,
  getSongById,
  deleteSong,
  downloadSong,
  toggleFavorite,
  getSongStats,
} = require("../controller/songController");

// All routes require authentication
router.use(auth);

// GET /api/songs/stats  — must be before /:id to avoid conflict
router.get("/stats", getSongStats);

// GET /api/songs?q=&style=&sort=&page=&limit=
router.get("/", getMySongs);

// Sub-routes MUST come before /:id to avoid Express matching /:id first
// GET /api/songs/:id/download
router.get("/:id/download", downloadSong);

// PATCH /api/songs/:id/favorite
router.patch("/:id/favorite", toggleFavorite);

// GET /api/songs/:id
router.get("/:id", getSongById);

// DELETE /api/songs/:id
router.delete("/:id", deleteSong);

module.exports = router;
