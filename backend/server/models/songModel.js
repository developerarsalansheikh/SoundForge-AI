const mongoose = require("mongoose");

/**
 * Song — permanent record created after Cloudinary upload succeeds.
 * The Suno temporary URL is NEVER stored here; only the Cloudinary secure_url.
 */
const songSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Links back to the MusicGeneration task that produced this song
    taskId: { type: String, required: true, unique: true, index: true },

    // Generation parameters
    title:  { type: String, default: "Untitled Track", trim: true },
    prompt: { type: String, required: true, trim: true },
    enhancedPrompt: { type: String, default: null, trim: true },
    style:  { type: String, default: "General", trim: true },
    model:  { type: String, default: "V4_5ALL" },
    instrumental: { type: Boolean, default: false },

    // AI output
    lyrics:   { type: String, default: null },
    duration: { type: Number, default: null },

    // Cloudinary permanent audio storage (resource_type: "video")
    cloudinaryUrl:      { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },

    // Cover art — either from Suno or a placeholder
    coverImageUrl: { type: String, default: null },

    // User interactions
    isFavorite: { type: Boolean, default: false, index: true },
    playCount:  { type: Number,  default: 0 },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
songSchema.index({ title: "text", prompt: "text", style: "text" });

// Compound index for efficient user library queries
songSchema.index({ userId: 1, createdAt: -1 });
songSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model("Song", songSchema);