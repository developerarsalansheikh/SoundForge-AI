const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

exports.uploadToCloudinary = async (base64) => {
  return cloudinary.uploader.upload(
    `data:audio/mp3;base64,${base64}`,
    {
      resource_type: "video",
      folder: "ai_songs"
    }
  );
};



