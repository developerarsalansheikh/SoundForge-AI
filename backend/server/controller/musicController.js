/**
 * musicController.js
 *
 * Suno API integration — dual-mode: callback (production) + polling (fallback/local dev).
 *
 * Official Suno API shapes (sunoapi.org):
 *
 *   POST /api/v1/generate  →  { code:200, data:{ taskId:"..." } }
 *
 *   GET  /api/v1/generate/record-info?taskId=X  →
 *   {
 *     code: 200,
 *     data: {
 *       taskId: "...",
 *       status: "SUCCESS" | "PENDING" | "TEXT_SUCCESS" | "FIRST_SUCCESS" | "CREATE_TASK_FAILED" | ...
 *       sunoData: [
 *         {
 *           id:        "...",
 *           audioUrl:  "https://...",
 *           imageUrl:  "https://...",
 *           title:     "...",
 *           lyrics:    "...",
 *           duration:  198.44
 *         }
 *       ]
 *     }
 *   }
 *
 *   Callback POST to callBackUrl — body shape:
 *   {
 *     code: 200,
 *     data: {
 *       callbackType: "complete" | "first" | "text" | "error",
 *       task_id: "...",
 *       data: [ { audio_url, stream_audio_url, image_url, title, lyrics, duration, ... } ]
 *     }
 *   }
 */

"use strict";

const axios        = require("axios");
const { Readable } = require("stream");
const User         = require("../models/userModel");
const MusicGen     = require("../models/musicGenerationModel");
const Song         = require("../models/songModel");
const cloudinary   = require("../config/cloudinaryConfig");
const { enhancePrompt } = require("../utils/promptEnhancer");

const SUNO_BASE_URL = "https://api.sunoapi.org/api/v1";

// ─── Cloudinary helpers ───────────────────────────────────────────────────────

async function downloadAudioBuffer(url) {
  console.log(`[Cloudinary] Downloading audio buffer from: ${url}`);
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 120_000 });
  return Buffer.from(res.data);
}

function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "ai-songs", public_id: publicId, overwrite: true, format: "mp3" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

/**
 * Download Suno audio → upload to Cloudinary → create/update Song document.
 * Returns the permanent cloudinaryUrl.
 */
async function persistSongToCloudinary({ record, audioUrl, imageUrl, lyrics, songTitle, duration }) {
  const cloudinaryPublicId = `ai-songs/${record.userId}_${record.taskId}`;

  console.log(`[Cloudinary] Starting upload for taskId: ${record.taskId}`);
  const buffer = await downloadAudioBuffer(audioUrl);
  const cldRes = await uploadBufferToCloudinary(buffer, cloudinaryPublicId);
  console.log(`[Cloudinary] Upload success: ${cldRes.secure_url}`);

  // Create or update the permanent Song record
  const songData = {
    userId:             record.userId,
    taskId:             record.taskId,
    title:              record.title || songTitle || "Untitled Track",
    prompt:             record.prompt || "",
    enhancedPrompt:     record.enhancedPrompt || null,
    style:              record.style  || "General",
    model:              record.model  || "V4_5ALL",
    instrumental:       record.instrumental || false,
    lyrics,
    duration,
    cloudinaryUrl:      cldRes.secure_url,
    cloudinaryPublicId: cldRes.public_id,
    coverImageUrl:      imageUrl || null,
  };

  const song = await Song.findOneAndUpdate(
    { taskId: record.taskId },
    songData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Update MusicGeneration record
  record.cloudinaryUrl      = cldRes.secure_url;
  record.cloudinaryPublicId = cldRes.public_id;
  record.cloudinaryUpload   = "done";
  await record.save();

  return { cloudinaryUrl: cldRes.secure_url, song };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract track data from either:
 *   - A POLL response body (from GET /api/v1/generate/record-info)
 *     Shape: { code, data: { taskId, status, response: { taskId, sunoData:[{audioUrl,imageUrl,...}] } } }
 *
 *   - A CALLBACK body (from POST callBackUrl)
 *     Shape: { code, data: { callbackType, task_id, data:[{audio_url,image_url,...}] } }
 *
 * Pass in the FULL response body (axios .data).
 */
function extractTrack(body) {
  console.log("[extractTrack] Parsing body:", JSON.stringify(body, null, 2));

  let taskId      = null;
  let status      = null;
  let tracks      = [];

  // ── Poll response shape ─────────────────────────────────────────────────────
  // body = { code, data: { taskId, status, response:{ taskId, sunoData:[] } } }
  const pollData = body?.data; // the inner data object
  if (pollData?.response?.sunoData) {
    // This is a poll response
    taskId  = pollData.taskId  || pollData.response?.taskId  || null;
    status  = pollData.status  || null;   // "SUCCESS" | "PENDING" | "FIRST_SUCCESS" etc.
    tracks  = Array.isArray(pollData.response.sunoData) ? pollData.response.sunoData : [];
    console.log(`[extractTrack] Detected POLL shape — status: ${status}, tracks: ${tracks.length}`);
  }
  // ── Callback body shape ─────────────────────────────────────────────────────
  // body = { code, data: { callbackType, task_id, data:[] } }
  else if (pollData?.callbackType || pollData?.task_id) {
    taskId  = pollData.task_id  || pollData.taskId  || null;
    status  = pollData.callbackType || null;   // "complete" | "first" | "text"
    tracks  = Array.isArray(pollData.data) ? pollData.data : [];
    console.log(`[extractTrack] Detected CALLBACK shape — callbackType: ${status}, tracks: ${tracks.length}`);
  }
  else {
    // Fallback — try to pull whatever we can find
    taskId  = pollData?.taskId || pollData?.task_id || body?.taskId || body?.task_id || null;
    status  = pollData?.status || pollData?.callbackType || body?.callbackType || null;
    if (Array.isArray(pollData?.data))     tracks = pollData.data;
    else if (Array.isArray(pollData?.sunoData)) tracks = pollData.sunoData;
    console.log(`[extractTrack] Using FALLBACK shape — status: ${status}, tracks: ${tracks.length}`);
  }

  const track = tracks[0] || null;

  // Tracks from poll have camelCase; tracks from callback have snake_case
  const audioUrl       = track?.audioUrl       || track?.audio_url       || null;
  const streamAudioUrl = track?.streamAudioUrl || track?.stream_audio_url || null;
  const imageUrl       = track?.imageUrl       || track?.image_url       || null;
  const lyrics         = track?.lyrics                                    || null;
  const songTitle      = track?.title          || track?.songTitle        || "Untitled Track";
  const duration       = track?.duration                                  || null;

  console.log(`[extractTrack] Extracted → taskId:${taskId} status:${status} audioUrl:${audioUrl}`);

  return { taskId, callbackType: status, audioUrl, streamAudioUrl, imageUrl, lyrics, songTitle, duration };
}

/**
 * Generation is complete (we have real audio) when status is one of these.
 */
function isDone(statusOrCallbackType) {
  if (!statusOrCallbackType) return false;
  const s = statusOrCallbackType.toLowerCase();
  // Poll statuses: SUCCESS, FIRST_SUCCESS
  // Callback types: complete, first
  return s === "success" || s === "first_success" || s === "complete" || s === "first";
}

/**
 * Determine if a status or callbackType is a terminal error state.
 */
function isError(statusOrCallbackType) {
  if (!statusOrCallbackType) return false;
  const s = statusOrCallbackType.toLowerCase();
  return (
    s === "error"
    || s === "create_task_failed"
    || s === "generate_audio_failed"
    || s === "callback_exception"
    || s === "sensitive_word_error"
    || s.includes("fail")
    || s.includes("exception")
  );
}

// ─── POST /api/music/generate ─────────────────────────────────────────────────
/**
 * Authenticated. Steps:
 *   1. Fetch user's Suno API key from MongoDB
 *   2. Create a pending MusicGeneration record
 *   3. Build the payload — set callBackUrl if BACKEND_URL is configured,
 *      otherwise omit it (polling will be used instead)
 *   4. Call Suno generate endpoint
 *   5. Persist the taskId on the MusicGeneration record
 *   6. Return { success, taskId, mode:"callback"|"poll" } to the frontend
 */
const generateMusic = async (req, res) => {
  const userId = req.user?._id;
  console.log(`\n🎵 [Frontend → Backend] POST /api/music/generate requested by User: ${userId}`);

  try {
    // ── 1. Get user's stored Suno API key ─────────────────────────────────
    console.log(`[Backend → MongoDB] Querying user database for Suno API Key, User: ${userId}`);
    const user = await User.findById(userId).select("sunoApiKey");
    if (!user) {
      console.warn(`[Backend → MongoDB] User not found: ${userId}`);
      return res.status(404).json({ success: false, error: "User not found." });
    }
    if (!user.sunoApiKey?.trim()) {
      console.warn(`[Backend → MongoDB] No Suno API key found for user: ${userId}`);
      return res.status(400).json({
        success: false,
        error: "No Suno API key found. Please add your key in Settings first.",
      });
    }
    const sunoApiKey = user.sunoApiKey.trim();
    console.log(`[Backend → MongoDB] Suno key found for User: ${userId} (Key starting with: ${sunoApiKey.substring(0, 8)}...)`);

    // ── 2. Validate request body ──────────────────────────────────────────
    const {
      prompt,
      style             = "General",
      title             = "Untitled Track",
      instrumental      = false,
      model             = "V4_5ALL",
      vocalGender       = "m",
      styleWeight       = 0.65,
      weirdnessConstraint = 0.65,
      audioWeight       = 0.65,
    } = req.body;

    console.log(`[Backend] Validating request parameters: prompt length = ${prompt?.length || 0}`);
    if (!prompt?.trim()) {
      console.warn(`[Backend] Validation failed: Prompt is empty`);
      return res.status(400).json({ success: false, error: "Prompt is required." });
    }

    // ── 2.5 Enhance Prompt ────────────────────────────────────────────────
    const { enhancedPrompt, detectedGenre } = enhancePrompt(prompt, style);
    console.log("\n==================================================");
    console.log("[AI PROMPT ENGINEER]");
    console.log(`Original Prompt: ${prompt.trim()}`);
    console.log(`Enhanced Prompt: ${enhancedPrompt}`);
    console.log(`Final Prompt Sent to Suno: ${enhancedPrompt}`);
    console.log(`Detected Genre: ${detectedGenre}`);
    console.log("==================================================\n");

    // ── 3. Decide callback URL ────────────────────────────────────────────
    const backendUrl  = (process.env.BACKEND_URL || "").trim();
    // Suno API requires a callback URL; if local or empty, fallback to a dummy public HTTPS URL
    const callBackUrl = backendUrl 
      ? `${backendUrl}/api/music/callback` 
      : "https://example.com/api/music/callback";

    // Since we are using a dummy callback on localhost, the backend still polls (mode = "poll")
    const mode = backendUrl ? "callback" : "poll";
    console.log(`[Backend] Generation mode: ${mode} | callBackUrl sent to Suno: ${callBackUrl}`);

    // ── 4. Build Suno payload ─────────────────────────────────────────────
    // Note: personaId and negativeTags are OMITTED entirely when not used
    // (sending null for these fields may fail Suno's field validation).
    const sunoPayload = {
      customMode:          true,
      instrumental,
      model,
      callBackUrl,
      prompt:              enhancedPrompt,
      style,
      title,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
    };

    // ── 5. Create a pending record before calling Suno ────────────────────
    console.log(`[Backend → MongoDB] Storing initial pending MusicGeneration record...`);
    const record = await MusicGen.create({
      userId,
      taskId:       `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status:       "pending",
      prompt:       prompt.trim(),
      enhancedPrompt,
      style,
      model,
      title,
      instrumental,
    });
    console.log(`[Backend → MongoDB] Initial pending record saved: _id=${record._id}`);

    // ── 6. Call Suno generate ─────────────────────────────────────────────
    const maskedApiKey = sunoApiKey ? `${sunoApiKey.substring(0, 8)}...[masked]` : "none";
    const outgoingHeaders = {
      Authorization: `Bearer ${maskedApiKey}`,
      "Content-Type": "application/json",
    };

    console.log(`[Backend → Suno Generate] Request URL: ${SUNO_BASE_URL}/generate`);
    console.log(`[Backend → Suno Generate] Request Headers:`, JSON.stringify(outgoingHeaders, null, 2));
    console.log(`[Backend → Suno Generate] Request Body:`, JSON.stringify(sunoPayload, null, 2));

    let sunoRes;
    try {
      sunoRes = await axios.post(
        `${SUNO_BASE_URL}/generate`,
        sunoPayload,
        {
          headers: {
            Authorization:  `Bearer ${sunoApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30_000,
        }
      );
    } catch (sunoErr) {
      console.error(`[Backend → Suno Generate] Suno API Call Failed! deleting record _id=${record._id}`);
      await record.deleteOne(); // clean up the orphaned pending record
      
      const httpStatus = sunoErr.response?.status;
      const errData    = sunoErr.response?.data;
      console.error(`[Backend → Suno Generate] Error HTTP Status: ${httpStatus || "unknown"}`, errData || sunoErr.message);

      if (httpStatus === 401 || httpStatus === 403) {
        return res.status(400).json({
          success: false,
          error: "Invalid or expired Suno API key. Please update it in Settings.",
        });
      }
      return res.status(502).json({
        success: false,
        error: "Suno API request failed.",
        details: errData?.msg || sunoErr.message,
      });
    }

    console.log(`[Backend ← Suno Generate] Response Status: ${sunoRes.status}`);
    console.log(`[Backend ← Suno Generate] Response Body:`, JSON.stringify(sunoRes.data, null, 2));

    // Check if Suno returned a non-200 code in the response body
    if (sunoRes.data?.code && sunoRes.data.code !== 200) {
      console.error(`[Backend ← Suno Generate] Suno API returned error code ${sunoRes.data.code}: ${sunoRes.data.msg}`);
      await record.deleteOne(); // clean up the orphaned pending record
      return res.status(200).json({
        success: false,
        error: sunoRes.data.msg || "Suno API request failed.",
        sunoResponse: sunoRes.data,
      });
    }

    // ── 7. Validate Suno response — expect data.taskId ───────────────────
    const taskId = sunoRes.data?.data?.taskId || sunoRes.data?.data?.task_id || sunoRes.data?.taskId || sunoRes.data?.task_id;
    if (!taskId) {
      console.error(`[Backend ← Suno Generate] Failed to find taskId/task_id in Suno response:`, sunoRes.data);
      await record.deleteOne();
      return res.status(200).json({
        success: false,
        error: sunoRes.data?.msg || "Suno did not return a taskId.",
        sunoResponse: sunoRes.data,
      });
    }

    // ── 8. Persist the real taskId and snake_case fields ──────────────────
    console.log(`[Backend → MongoDB] Updating pending record with real taskId: ${taskId}`);
    record.taskId = taskId;
    record.task_id = taskId;
    await record.save();
    console.log(`[Backend → MongoDB] Saved record successfully with taskId: ${taskId}`);

    // ── 9. Respond to frontend ────────────────────────────────────────────
    console.log(`[Backend → Frontend] Returning response with success: true, taskId: ${taskId}`);
    return res.status(200).json({
      success: true,
      taskId,
      recordId: record._id,
      mode,   // "callback" | "poll" — frontend uses this to decide strategy
    });

  } catch (err) {
    console.error("[Backend] Unexpected error in generateMusic:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      error: "Internal server error during music generation.",
      details: err.message,
    });
  }
};

// ─── GET /api/music/status/:taskId ────────────────────────────────────────────
/**
 * Authenticated. Single poll — checks our DB first, then calls Suno only
 * if the record is still pending.
 */
const getSongStatus = async (req, res) => {
  const userId = req.user?._id;
  const { taskId } = req.params;
  console.log(`\n🔄 [Frontend → Backend] GET /api/music/status/${taskId} requested by User: ${userId}`);

  if (!taskId) {
    console.warn(`[Backend] Missing taskId in request parameters`);
    return res.status(400).json({ success: false, error: "taskId is required." });
  }

  try {
    // ── 1. Check our own DB first (callback may have already filled it) ──
    console.log(`[Backend → MongoDB] Checking local database for taskId: ${taskId}`);
    const record = await MusicGen.findOne({ taskId, userId });
    if (!record) {
      console.warn(`[Backend → MongoDB] Task not found in DB: taskId=${taskId}, userId=${userId}`);
      return res.status(404).json({
        success: false,
        error: "Task not found. It may belong to a different user.",
      });
    }

    if (record.status === "complete") {
      console.log(`[Backend → MongoDB] Task is already complete in local DB for taskId: ${taskId}`);
      return res.status(200).json({
        success:  true,
        done:     true,
        audioUrl: record.audioUrl,
        stream_audio_url: record.stream_audio_url,
        imageUrl: record.imageUrl,
        lyrics:   record.lyrics,
        title:    record.songTitle,
        duration: record.duration,
        taskId,
        status:   "complete",
      });
    }

    if (record.status === "error") {
      console.log(`[Backend → MongoDB] Task has error state in local DB for taskId: ${taskId}`);
      return res.status(200).json({
        success:      false,
        done:         true,
        taskId,
        status:       "error",
        error:        record.errorMessage || "Generation failed.",
      });
    }

    // ── 2. Still pending — poll Suno directly ─────────────────────────────
    console.log(`[Backend → MongoDB] Task is still pending. Retrieving user Suno API Key from MongoDB...`);
    const user = await User.findById(userId).select("sunoApiKey");
    if (!user?.sunoApiKey) {
      console.warn(`[Backend → MongoDB] Suno API Key not found for user: ${userId}`);
      return res.status(400).json({
        success: false,
        error: "No Suno API key found.",
      });
    }
    const sunoApiKey = user.sunoApiKey.trim();

    console.log(`[Backend → Suno Generate] Polling Suno details for taskId: ${taskId}`);
    let pollRes;
    try {
      pollRes = await axios.get(
        `${SUNO_BASE_URL}/generate/record-info?taskId=${taskId}`,
        {
          headers: { Authorization: `Bearer ${sunoApiKey}` },
          timeout: 20_000,
        }
      );
    } catch (pollErr) {
      const httpStatus = pollErr.response?.status;
      const errData    = pollErr.response?.data;
      console.error(`[Backend → Suno Generate] Suno Poll Failed with HTTP Status: ${httpStatus || "unknown"}`, errData || pollErr.message);

      if (httpStatus === 401 || httpStatus === 403) {
        return res.status(400).json({ success: false, error: "Invalid or expired Suno API key." });
      }
      return res.status(502).json({
        success: false,
        error: "Suno poll request failed.",
        details: errData?.msg || pollErr.message,
      });
    }

    console.log(`[Backend ← Suno Generate] Suno poll response:`, JSON.stringify(pollRes.data, null, 2));

    // ── 3. Parse status and tracks ────────────────────────────────────────
    const { taskId: parsedTaskId, callbackType, audioUrl, streamAudioUrl, imageUrl, lyrics, songTitle, duration } = extractTrack(pollRes.data);

    if (isError(callbackType)) {
      console.error(`[Backend ← Suno Generate] Suno reported generation error: ${callbackType}`);
      record.status = "error";
      record.errorMessage = callbackType || "Generation failed on Suno side.";
      record.rawCallbackPayload = pollRes.data;
      await record.save();

      return res.status(200).json({
        success: false,
        done: true,
        taskId,
        status: "error",
        error: record.errorMessage,
      });
    }

    if (isDone(callbackType) && audioUrl) {
      console.log(`[Backend → MongoDB] Generation finished! Updating MusicGeneration record for taskId: ${taskId}`);
      record.status            = "complete";
      record.audioUrl          = audioUrl;   // temp; not returned to client
      record.imageUrl          = imageUrl;
      record.lyrics            = lyrics;
      record.songTitle         = songTitle || record.title;
      record.duration          = duration;
      record.task_id           = taskId;
      record.callbackType      = callbackType;
      record.audio_url         = audioUrl;
      record.stream_audio_url  = streamAudioUrl;
      record.image_url         = imageUrl;
      record.rawCallbackPayload = pollRes.data;
      await record.save();

      // ── Upload audio to Cloudinary & create permanent Song document ───────
      let cloudinaryUrl = null;
      let songId        = null;
      try {
        const result  = await persistSongToCloudinary({ record, audioUrl, imageUrl, lyrics, songTitle: songTitle || record.title, duration });
        cloudinaryUrl = result.cloudinaryUrl;
        songId        = result.song._id;
        console.log(`[Cloudinary] Permanent song saved. songId: ${songId} url: ${cloudinaryUrl}`);
      } catch (cldErr) {
        // Don't fail the response — log and let client use audioUrl as fallback
        console.error(`[Cloudinary] Upload failed for taskId ${taskId}:`, cldErr.message);
        cloudinaryUrl = audioUrl; // graceful fallback
      }

      return res.status(200).json({
        success:      true,
        done:         true,
        audioUrl:     cloudinaryUrl,   // always return the permanent URL
        imageUrl,
        lyrics,
        title:        songTitle || record.title,
        duration,
        taskId,
        songId,
        status:       callbackType,
      });
    }

    // Not done yet
    console.log(`[Backend → Frontend] Task ${taskId} is still in progress (Status: ${callbackType || "pending"})`);
    return res.status(200).json({
      success: true,
      done:    false,
      taskId,
      status:  callbackType || "pending",
    });

  } catch (err) {
    console.error("[Backend] Unexpected error in getSongStatus:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      error: "Internal server error during status poll.",
      details: err.message,
    });
  }
};

// ─── POST /api/music/callback ─────────────────────────────────────────────────
/**
 * Public (no auth — called by Suno's servers).
 * Receives the generation result and updates the MusicGeneration record.
 */
const handleCallback = async (req, res) => {
  // Acknowledge immediately — Suno has a 15s timeout on callbacks
  res.status(200).json({ received: true });

  console.log("\n📞 [Callback → Backend] Received Suno webhook callback POST request:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const body         = req.body;
    const inner        = body?.data;                        // { callbackType, task_id, data:[] }
    const callbackType = inner?.callbackType || inner?.status || body?.callbackType || body?.status;
    const taskId       = inner?.task_id || inner?.taskId || body?.task_id || body?.taskId;

    if (!taskId) {
      console.error("[Callback] Unable to extract task_id / taskId from callback payload");
      return;
    }

    console.log(`[Callback] Processing callback for taskId: ${taskId} | callbackType: ${callbackType}`);

    console.log(`[Callback → MongoDB] Querying database for record matching taskId: ${taskId}`);
    const record = await MusicGen.findOne({ taskId });
    if (!record) {
      console.warn(`[Callback → MongoDB] No record found in DB for taskId: ${taskId}`);
      return;
    }

    if (isError(callbackType)) {
      console.error(`[Callback → MongoDB] Callback reported error for taskId: ${taskId}. Marking task as error.`);
      record.status       = "error";
      record.errorMessage = inner?.msg || inner?.error || body?.msg || "Suno generation failed.";
      record.task_id      = taskId;
      record.callbackType = callbackType;
      record.rawCallbackPayload = body;
      await record.save();
      console.log(`[Callback → MongoDB] Saved error state for taskId: ${taskId}`);
      return;
    }

    // Extract track using helper
    const { audioUrl, streamAudioUrl, imageUrl, lyrics, songTitle, duration } = extractTrack(body);

    if (isDone(callbackType) && audioUrl) {
      console.log(`[Callback → MongoDB] Task completed! Saving complete track details for taskId: ${taskId}`);
      record.status            = "complete";
      record.audioUrl          = audioUrl;
      record.imageUrl          = imageUrl;
      record.lyrics            = lyrics;
      record.songTitle         = songTitle;
      record.duration          = duration;

      // Save snake_case equivalents requested by user
      record.task_id           = taskId;
      record.callbackType      = callbackType;
      record.audio_url         = audioUrl;
      record.stream_audio_url  = streamAudioUrl;
      record.image_url         = imageUrl;
      record.title             = songTitle;
      record.rawCallbackPayload = body;

      await record.save();
      console.log(`[Callback → MongoDB] Record updated successfully for taskId: ${taskId} — audio: ${audioUrl}`);
    } else {
      // Intermediate callback (e.g. "text", "first") — log and save details
      console.log(`[Callback → MongoDB] Intermediate callback status: ${callbackType}. Saving progress...`);
      record.task_id           = taskId;
      record.callbackType      = callbackType;
      if (audioUrl) {
        record.audioUrl        = audioUrl;
        record.audio_url       = audioUrl;
      }
      if (streamAudioUrl) {
        record.stream_audio_url = streamAudioUrl;
      }
      if (imageUrl) {
        record.imageUrl        = imageUrl;
        record.image_url       = imageUrl;
      }
      if (songTitle) {
        record.songTitle       = songTitle;
        record.title           = songTitle;
      }
      if (duration) {
        record.duration        = duration;
      }
      record.rawCallbackPayload = body;
      await record.save();
      console.log(`[Callback → MongoDB] Saved intermediate state for taskId: ${taskId}`);
    }

  } catch (err) {
    console.error("[Callback] Unexpected error inside handleCallback:", err.message, err.stack);
  }
};

module.exports = { generateMusic, getSongStatus, handleCallback };
