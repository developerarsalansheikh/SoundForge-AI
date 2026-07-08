"use strict";

const axios      = require("axios");
const cloudinary = require("../config/cloudinaryConfig");
const Song       = require("../models/songModel");

// ─── Helper: Download audio buffer from URL ───────────────────────────────────
async function downloadBuffer(url) {
  console.log(`[Cloudinary] Downloading audio from: ${url}`);
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 120_000, // 2 min for large files
  });
  return Buffer.from(response.data);
}

// ─── Helper: Upload buffer to Cloudinary as audio ─────────────────────────────
function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // Cloudinary uses "video" for audio files
        folder: "ai-songs",
        public_id: publicId,
        overwrite: true,
        format: "mp3",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const { Readable } = require("stream");
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

// ─── GET /api/songs ───────────────────────────────────────────────────────────
/**
 * Get authenticated user's song library.
 * Supports: search (q), filter by style, sort by newest/oldest/title, pagination.
 */
const getMySongs = async (req, res) => {
  const userId = req.user._id;
  const {
    q,
    style,
    sort    = "newest",
    page    = 1,
    limit   = 12,
    favorites,
  } = req.query;

  console.log(`[Songs] GET /api/songs — userId: ${userId} query:`, req.query);

  try {
    const filter = { userId };

    // Text search
    if (q?.trim()) {
      filter.$text = { $search: q.trim() };
    }

    // Style filter
    if (style && style !== "all") {
      filter.style = { $regex: new RegExp(style, "i") };
    }

    // Favorites filter
    if (favorites === "true") {
      filter.isFavorite = true;
    }

    // Sort
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt:  1 },
      title:  { title: 1 },
      duration: { duration: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [songs, total] = await Promise.all([
      Song.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Song.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      songs,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext:    pageNum < Math.ceil(total / limitNum),
        hasPrev:    pageNum > 1,
      },
    });
  } catch (err) {
    console.error("[Songs] getMySongs error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch songs." });
  }
};

// ─── GET /api/songs/:id ───────────────────────────────────────────────────────
const getSongById = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const song = await Song.findOne({ _id: id, userId });
    if (!song) {
      return res.status(404).json({ success: false, error: "Song not found." });
    }

    // Increment play count
    await Song.findByIdAndUpdate(id, { $inc: { playCount: 1 } });

    return res.json({ success: true, song });
  } catch (err) {
    console.error("[Songs] getSongById error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch song." });
  }
};

// ─── DELETE /api/songs/:id ────────────────────────────────────────────────────
const deleteSong = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  console.log(`[Songs] DELETE /api/songs/${id} — userId: ${userId}`);

  try {
    const song = await Song.findOne({ _id: id, userId });
    if (!song) {
      return res.status(404).json({ success: false, error: "Song not found." });
    }

    // Delete from Cloudinary first
    if (song.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(song.cloudinaryPublicId, {
          resource_type: "video",
        });
        console.log(`[Cloudinary] Deleted asset: ${song.cloudinaryPublicId}`);
      } catch (cloudErr) {
        // Log but don't block DB deletion
        console.error("[Cloudinary] Failed to delete asset:", cloudErr.message);
      }
    }

    await Song.findByIdAndDelete(id);

    return res.json({ success: true, message: "Song deleted successfully." });
  } catch (err) {
    console.error("[Songs] deleteSong error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to delete song." });
  }
};

// ─── GET /api/songs/:id/download ─────────────────────────────────────────────
const downloadSong = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const song = await Song.findOne({ _id: id, userId });
    if (!song) {
      return res.status(404).json({ success: false, error: "Song not found." });
    }

    // Stream from Cloudinary directly
    const audioRes = await axios.get(song.cloudinaryUrl, {
      responseType: "stream",
      timeout: 60_000,
    });

    const filename = `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "audio/mpeg");

    audioRes.data.pipe(res);
  } catch (err) {
    console.error("[Songs] downloadSong error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to download song." });
  }
};

// ─── PATCH /api/songs/:id/favorite ───────────────────────────────────────────
const toggleFavorite = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const song = await Song.findOne({ _id: id, userId });
    if (!song) {
      return res.status(404).json({ success: false, error: "Song not found." });
    }

    song.isFavorite = !song.isFavorite;
    await song.save();

    return res.json({
      success: true,
      isFavorite: song.isFavorite,
      message: song.isFavorite ? "Added to favorites." : "Removed from favorites.",
    });
  } catch (err) {
    console.error("[Songs] toggleFavorite error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to update favorite." });
  }
};

// ─── GET /api/songs/stats ─────────────────────────────────────────────────────
const getSongStats = async (req, res) => {
  const userId = req.user._id;

  try {
    const [total, favorites, recent] = await Promise.all([
      Song.countDocuments({ userId }),
      Song.countDocuments({ userId, isFavorite: true }),
      Song.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return res.json({ success: true, stats: { total, favorites, recent } });
  } catch (err) {
    console.error("[Songs] getSongStats error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch stats." });
  }
};

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {
  getMySongs,
  getSongById,
  deleteSong,
  downloadSong,
  toggleFavorite,
  getSongStats,
  // helpers exported for use in musicController
  downloadBuffer,
  uploadToCloudinary,
};
