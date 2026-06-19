import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;
const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (!isCloudinaryConfigured) {
  console.warn(
    "Cloudinary environment variables are missing. Upload routes are disabled until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set."
  );
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    cloudinary_url: cloudinaryUrl,
    secure: true,
  });
}

export { isCloudinaryConfigured };
export default cloudinary;