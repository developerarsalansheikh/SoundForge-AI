const cloudinary = require("cloudinary").v2;

/**
 * Cloudinary v2 config.
 * Reads from CLOUDINARY_URL if set (e.g. cloudinary://key:secret@cloud_name),
 * or falls back to individual CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET vars.
 */
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
}
// If CLOUDINARY_URL is present, the SDK auto-reads it — nothing extra needed.
cloudinary.config({ secure: true });

module.exports = cloudinary;
