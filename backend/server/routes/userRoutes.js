const express = require("express");
const router = express.Router();
const {
  getApiKey,
  saveApiKey,
  updateApiKey,
  deleteApiKey,
} = require("../controller/userController");
const protect = require("../middleware/authMiddleware");

// All routes are protected by JWT auth
router.route("/api-key")
  .get(protect, getApiKey)
  .post(protect, saveApiKey)
  .put(protect, updateApiKey)
  .delete(protect, deleteApiKey);

module.exports = router;
