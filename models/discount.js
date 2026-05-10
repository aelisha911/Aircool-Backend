import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);