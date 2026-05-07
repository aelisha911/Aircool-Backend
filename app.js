import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import emailRoutes from "./routes/emailRoutes.js";
import cors from "cors";
dotenv.config();

const app = express();

// ✅ VERY IMPORTANT MIDDLEWARES
app.use(cors({
  origin: "http://localhost:8080", // Vite frontend
  methods: ["GET", "POST"],
  credentials: true,
}));
// Database Connection
connectDB();

// Middleware
app.use(express.json());
app.use("/api", emailRoutes);
// All routes here
// app.use("/api", routes);

// Test Route
app.get("/", (req, res) => {
  res.send("Sage Motors Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
