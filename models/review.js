import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: String,
    
    trim: true,
  },
  review: {
    type: String,
   
    trim: true,
  },
  rating: {
    type: Number,
    
    min: 1,
    max: 5,
  },
  isInactive: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Review", reviewSchema);