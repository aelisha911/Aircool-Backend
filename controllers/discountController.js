import Discount from "../models/discount.js";
import fs from "fs";
import path from "path";

const parseBool = (v) => v === "on" || v === "true" || v === "1" || v === true;

const getUploadedFile = (files, fieldNames) => {
  if (!files || !Array.isArray(files)) return null;
  return files.find((file) => fieldNames.includes(file.fieldname)) || null;
};

export const createDiscount = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const isInactive = parseBool(req.body.isInactive);

    const imageFile = getUploadedFile(req.files, ["image", "imageUrl"]);
    const videoFile = getUploadedFile(req.files, ["video", "videoUrl"]);

    const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : undefined;
    const videoUrl = videoFile ? `/uploads/${videoFile.filename}` : undefined;

    const discount = await Discount.create({ title, imageUrl, videoUrl, isInactive });
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findById(id);
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    const { title } = req.body;
    if (title) discount.title = title;

    if (req.body.isInactive !== undefined) discount.isInactive = parseBool(req.body.isInactive);

    const imageFile = getUploadedFile(req.files, ["image", "imageUrl"]);
    const videoFile = getUploadedFile(req.files, ["video", "videoUrl"]);

    if (imageFile) {
      if (discount.imageUrl) {
        const oldName = path.basename(discount.imageUrl);
        const oldPath = path.join(process.cwd(), "uploads", oldName);
        try {
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn("Failed to delete old image", e.message);
        }
      }
      discount.imageUrl = `/uploads/${imageFile.filename}`;
    }

    if (videoFile) {
      if (discount.videoUrl) {
        const oldName = path.basename(discount.videoUrl);
        const oldPath = path.join(process.cwd(), "uploads", oldName);
        try {
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn("Failed to delete old video", e.message);
        }
      }
      discount.videoUrl = `/uploads/${videoFile.filename}`;
    }

    await discount.save();
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findById(id);
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    // remove image file
    if (discount.imageUrl) {
      const fileName = path.basename(discount.imageUrl);
      const filePath = path.join(process.cwd(), "uploads", fileName);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("Failed to delete image on discount delete:", e.message);
      }
    }

    // remove video file
    if (discount.videoUrl) {
      const fileName = path.basename(discount.videoUrl);
      const filePath = path.join(process.cwd(), "uploads", fileName);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("Failed to delete video on discount delete:", e.message);
      }
    }

    await Discount.findByIdAndDelete(id);
    res.json({ message: "Discount deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
