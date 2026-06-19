import Discount from "../models/discount.js";

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

    const imageUrl = imageFile ? imageFile.secure_url || imageFile.path : undefined;
    const videoUrl = videoFile ? videoFile.secure_url || videoFile.path : undefined;

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
      discount.imageUrl = imageFile.secure_url || imageFile.path;
    }

    if (videoFile) {
      discount.videoUrl = videoFile.secure_url || videoFile.path;
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

    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    await Discount.findByIdAndDelete(id);

    res.json({ message: "Discount deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
