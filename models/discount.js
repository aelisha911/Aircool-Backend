import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    isInactive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);