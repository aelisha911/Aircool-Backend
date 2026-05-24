import express from "express";
import {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", listReviews);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;