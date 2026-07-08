const mongoose = require("mongoose");

/**
 * MusicGeneration — tracks the lifecycle of a single Suno async task.
 *
 * Lifecycle:  pending → complete | error
 *
 * Once status = "complete" and cloudinaryUpload = "done", a permanent
 * Song document will have been created separately.
 */
const musicGenerationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "complete", "error"],
      default: "pending",
    },

    // Generation parameters (stored for reference)
    prompt:       { type: String, default: "" },
    enhancedPrompt:{ type: String, default: null },
    style:        { type: String, default: "General" },
    model:        { type: String, default: "V4_5ALL" },
    title:        { type: String, default: "Untitled Track" },
    instrumental: { type: Boolean, default: false },

    // Suno result fields — populated when status = "complete"
    audioUrl:        { type: String, default: null }, // temp Suno URL (do not expose to client)
    imageUrl:        { type: String, default: null },
    lyrics:          { type: String, default: null },
    songTitle:       { type: String, default: "Untitled Track" },
    duration:        { type: Number, default: null },

    // Cloudinary upload tracking
    cloudinaryUrl:       { type: String, default: null },
    cloudinaryPublicId:  { type: String, default: null },
    cloudinaryUpload:    { type: String, enum: ["pending", "done", "failed"], default: "pending" },

    // Snake_case callback fields
    task_id:          { type: String, default: null },
    callbackType:     { type: String, default: null },
    audio_url:        { type: String, default: null },
    stream_audio_url: { type: String, default: null },
    image_url:        { type: String, default: null },

    // Error detail
    errorMessage:       { type: String, default: null },
    rawCallbackPayload: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MusicGeneration", musicGenerationSchema);
