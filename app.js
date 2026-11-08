import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import emailRoutes from "./routes/emailRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import homepageRoutes from "./routes/homepageRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ VERY IMPORTANT MIDDLEWARES
const frontendOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((origin) => origin.trim())
  : []; 

app.use(
  cors({
    origin: frontendOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
// Database Connection
connectDB().catch((err) => {
  console.log("DB Connection Error:", err);
});
// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", emailRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/homepage", homepageRoutes);
// // All routes here
// app.use("/api", routes);

// Test Route
// app.get("/", (req, res) => {
//   res.send("Aircool dynamics Backend Running 🚀");
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Homepage.html"));
});

app.get("/services/central-ducted-air-conditioning", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ducted-air-conditioning-adelaide.html"));
});

app.get("/services/ducted-gas-heating-adelaide", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ducted-gas-heating-adelaide.html"));
});

app.get("/services/evaporative-air-conditioning", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "evaporative-air-conditioning-adelaide.html"));
});

app.use((error, req, res, next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON request body", errors: [] });
  }
  next(error);
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "true") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;