import mongoose from "mongoose";

const homepageSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    eyebrow: { type: String, default: null },
    body: { type: String, default: null },
    buttonText: { type: String, default: null },
    buttonUrl: { type: String, default: null },
    imageUrl: { type: String, default: null },
    enabled: { type: Boolean, required: true, default: true },
    background: { type: String, default: null },
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    sortOrder: { type: Number, required: true },
  },
  { _id: false }
);

const homepageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "homepage" },
    sections: { type: [homepageSectionSchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Homepage", homepageSchema);
