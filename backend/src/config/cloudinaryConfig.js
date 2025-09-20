import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // ✅ Check file type before uploading
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov", ".avi"];
    const fileExt = path.extname(localFilePath).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      fs.unlinkSync(localFilePath); // delete unsupported file
      throw new Error("Only image and video files are allowed.");
    }

    // ✅ Decide resource_type manually
    const isVideo = [".mp4", ".mov", ".avi"].includes(fileExt);
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: isVideo ? "video" : "image",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // ensure file is deleted on error
    }
    console.error("Cloudinary Upload Error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary };
