import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

console.log("Upload middleware config:", cloudinary.config());

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "discounts",
      resource_type: file.mimetype.startsWith("video")
        ? "video"
        : "image",
    };
  },
});

const upload = multer({ storage });

export default upload;