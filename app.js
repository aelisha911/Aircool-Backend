import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import emailRoutes from "./routes/emailRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
dotenv.config();

const app = express();

// ✅ VERY IMPORTANT MIDDLEWARES
app.use(cors({
  origin: "http://localhost:8080", // Vite frontend
  methods: ["GET", "POST", "PUT"],
  credentials: true,
}));
// Database Connection
connectDB();

// Middleware
app.use(express.json());
app.use("/api", emailRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/discounts", discountRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
// // All routes here
// app.use("/api", routes);

// Test Route
app.get("/", (req, res) => {
  res.send("Sage Motors Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
