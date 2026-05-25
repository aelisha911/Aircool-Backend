import Review from "../models/review.js";

const parseBool = (v) => v === "on" || v === "true" || v === "1" || v === true;

export const createReview = async (req, res) => {
  try {
    const { name, description, starNumbers } = req.body;

    if (!name || !description || starNumbers === undefined) {
      return res.status(400).json({ message: "Name, description and starNumbers are required" });
    }

    const isInactive = parseBool(req.body.isInactive);

    const review = await Review.create({
      name,
      description,
      starNumbers: Number(starNumbers),
      isInactive,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { name, description, starNumbers } = req.body;

    if (name !== undefined) review.name = name;
    if (description !== undefined) review.description = description;
    if (starNumbers !== undefined) review.starNumbers = Number(starNumbers);
    if (req.body.isInactive !== undefined) review.isInactive = parseBool(req.body.isInactive);

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};