const express = require('express');
const router  = express.Router();
const { generateMusic, getSongStatus, handleCallback } = require('../controller/musicController');
const auth = require('../middleware/authMiddleware');

// POST /api/music/generate
// Authenticated — fetches the user's Suno key from DB, calls Suno, returns { taskId, mode }
router.post('/generate', auth, generateMusic);

// GET /api/music/status/:taskId
// Authenticated — checks DB first, then polls Suno if still pending
router.get('/status/:taskId', auth, getSongStatus);

// POST /api/music/callback
// PUBLIC — called by Suno's servers when generation completes
// No auth middleware: Suno does not send our JWT
router.post('/callback', handleCallback);

module.exports = router;
