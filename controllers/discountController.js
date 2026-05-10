import Discount from "../models/discount.js";
import fs from "fs";
import path from "path";

export const createDiscount = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const imageUrl = `/uploads/${req.file.filename}`;
    const discount = await Discount.create({ title, imageUrl });
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

    if (req.file) {
      // remove old file
      if (discount.imageUrl) {
        const oldName = path.basename(discount.imageUrl);
        const oldPath = path.join(process.cwd(), "uploads", oldName);
        try {
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn("Failed to delete old image", e.message);
        }
      }
      discount.imageUrl = `/uploads/${req.file.filename}`;
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

    // remove file
    if (discount.imageUrl) {
      const fileName = path.basename(discount.imageUrl);
      const filePath = path.join(process.cwd(), "uploads", fileName);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("Failed to delete image on discount delete:", e.message);
      }
    }

    await Discount.findByIdAndDelete(id);
    res.json({ message: "Discount deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
