import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import emailRoutes from "./routes/emailRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
dotenv.config();

const app = express();

// ✅ VERY IMPORTANT MIDDLEWARES
const frontendOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((origin) => origin.trim())
  : ["http://localhost:8080/", "https://aircool-frontend-d13o.onrender.com"];

app.use(cors({
  origin: frontendOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
// Database Connection
connectDB().catch((err) => {
  console.log("DB Connection Error:", err);
});

// Middleware
app.use(express.json());
app.use("/api", emailRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/discounts", discountRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
// // All routes here
// app.use("/api", routes);

// Test Route
app.get("/", (req, res) => {
  res.send("Aircool dynamics Backend Running 🚀");
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`Server running on port ${PORT}`)
// );

export default app;