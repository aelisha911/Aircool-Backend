import Review from "../models/review.js";

const parseBool = (v) => v === "on" || v === "true" || v === "1" || v === true;

export const createReview = async (req, res) => {
  try {
    const { reviewer, review, rating } = req.body;

    const isInactive = parseBool(req.body.isInactive);

    const reviewData = await Review.create({
      reviewer,
      review,
      rating: rating !== undefined && rating !== "" ? Number(rating) : undefined,
      isInactive,
    });

    res.status(201).json(reviewData);
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
    const reviewData = await Review.findById(id);

    if (!reviewData) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { reviewer, review, rating } = req.body;

    if (reviewer !== undefined) reviewData.reviewer = reviewer;
    if (review !== undefined) reviewData.review = review;

    if (rating !== undefined && rating !== "") {
      reviewData.rating = Number(rating);
    }

    if (req.body.isInactive !== undefined) {
      reviewData.isInactive = parseBool(req.body.isInactive);
    }

    await reviewData.save();

    res.json(reviewData);
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