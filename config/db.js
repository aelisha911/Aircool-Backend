import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB URI =", process.env.MONGODB_URI);

    // Remove legacy unique index from older schema versions if present.
    const discountsCollection = conn.connection.db.collection("discounts");
    const indexes = await discountsCollection.indexes();
    const hasLegacyKeyIndex = indexes.some((index) => index.name === "key_1");

    if (hasLegacyKeyIndex) {
      await discountsCollection.dropIndex("key_1");
      console.log("Removed legacy index: discounts.key_1");
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
