const express = require('express')
const router = express.Router();


const { uploadToCloudinary } = require("../utils/cloudinary");

router.get("/cloudinary-test", async (req, res) => {
  const dummy = Buffer.from("test file content");

  try {
    const result = await uploadToCloudinary(dummy, "test_file");
    res.json({ ok: true, url: result.secure_url });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

module.exports = router;
