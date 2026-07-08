const express = require("express");
const router = express.Router();

const { generateLyrics } = require("../controller/lyricsController");
const auth = require("../middleware/authMiddleware");

// POST -> Lyrics generate karega
router.post("/generate", auth, generateLyrics);

module.exports = router;
