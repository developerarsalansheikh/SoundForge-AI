const User = require("../models/userModel");

// @desc    Get user's Suno API Key
// @route   GET /api/user/api-key
// @access  Private
const getApiKey = async (req, res) => {
  const userId = req.user?._id;
  console.log(`[Frontend → Backend] GET /api/user/api-key requested by userId: ${userId}`);
  try {
    console.log(`[Backend → MongoDB] Querying user details for userId: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[Backend → MongoDB] User ${userId} not found in database`);
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const maskedKey = user.sunoApiKey ? `${user.sunoApiKey.substring(0, 8)}...` : "None";
    console.log(`[Backend → MongoDB] Successfully retrieved API Key for user: ${userId} (Key: ${maskedKey})`);
    return res.status(200).json({
      success: true,
      sunoApiKey: user.sunoApiKey || "",
    });
  } catch (error) {
    console.error(`[Backend] Failed to fetch API key for userId: ${userId}`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch API key",
      details: error.message,
    });
  }
};

// @desc    Save/Post user's Suno API Key
// @route   POST /api/user/api-key
// @access  Private
const saveApiKey = async (req, res) => {
  const userId = req.user?._id;
  console.log(`[Frontend → Backend] POST /api/user/api-key request received for userId: ${userId}`);
  try {
    const { sunoApiKey } = req.body;
    console.log(`[Backend] Validating API key input...`);
    if (!sunoApiKey || typeof sunoApiKey !== "string" || !sunoApiKey.trim()) {
      console.warn(`[Backend] API Key validation failed: Empty or invalid input`);
      return res.status(400).json({
        success: false,
        error: "Please provide a valid Suno API key",
      });
    }

    console.log(`[Backend → MongoDB] Finding user document for userId: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[Backend → MongoDB] User ${userId} not found in database`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`[Backend → MongoDB] Storing Suno API key in MongoDB for user: ${userId}`);
    user.sunoApiKey = sunoApiKey.trim();
    await user.save();

    console.log(`[Backend → MongoDB] API key saved successfully in MongoDB for user: ${userId}`);
    return res.status(200).json({
      success: true,
      message: "Suno API key saved successfully",
      sunoApiKey: user.sunoApiKey,
    });
  } catch (error) {
    console.error(`[Backend] Failed to save API key for userId: ${userId}`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to save API key",
      details: error.message,
    });
  }
};

// @desc    Update user's Suno API Key
// @route   PUT /api/user/api-key
// @access  Private
const updateApiKey = async (req, res) => {
  const userId = req.user?._id;
  console.log(`[Frontend → Backend] PUT /api/user/api-key request received for userId: ${userId}`);
  try {
    const { sunoApiKey } = req.body;
    console.log(`[Backend] Validating API key input...`);
    if (!sunoApiKey || typeof sunoApiKey !== "string" || !sunoApiKey.trim()) {
      console.warn(`[Backend] API Key validation failed: Empty or invalid input`);
      return res.status(400).json({
        success: false,
        error: "Please provide a valid Suno API key",
      });
    }

    console.log(`[Backend → MongoDB] Finding user document for userId: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[Backend → MongoDB] User ${userId} not found in database`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`[Backend → MongoDB] Updating Suno API key in MongoDB for user: ${userId}`);
    user.sunoApiKey = sunoApiKey.trim();
    await user.save();

    console.log(`[Backend → MongoDB] API key updated successfully in MongoDB for user: ${userId}`);
    return res.status(200).json({
      success: true,
      message: "Suno API key updated successfully",
      sunoApiKey: user.sunoApiKey,
    });
  } catch (error) {
    console.error(`[Backend] Failed to update API key for userId: ${userId}`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to update API key",
      details: error.message,
    });
  }
};

// @desc    Delete user's Suno API Key
// @route   DELETE /api/user/api-key
// @access  Private
const deleteApiKey = async (req, res) => {
  const userId = req.user?._id;
  console.log(`[Frontend → Backend] DELETE /api/user/api-key request received for userId: ${userId}`);
  try {
    console.log(`[Backend → MongoDB] Finding user document for userId: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[Backend → MongoDB] User ${userId} not found in database`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log(`[Backend → MongoDB] Removing Suno API key in MongoDB for user: ${userId}`);
    user.sunoApiKey = null;
    await user.save();

    console.log(`[Backend → MongoDB] API key deleted successfully from MongoDB for user: ${userId}`);
    return res.status(200).json({
      success: true,
      message: "Suno API key deleted successfully",
    });
  } catch (error) {
    console.error(`[Backend] Failed to delete API key for userId: ${userId}`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete API key",
      details: error.message,
    });
  }
};

module.exports = {
  getApiKey,
  saveApiKey,
  updateApiKey,
  deleteApiKey,
};
