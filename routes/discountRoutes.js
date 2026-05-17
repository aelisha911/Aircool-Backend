import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createDiscount, listDiscounts } from "../controllers/discountController.js";
import { updateDiscount, deleteDiscount } from "../controllers/discountController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.any(), createDiscount);
router.get("/", listDiscounts);
router.put("/:id", upload.any(), updateDiscount);
router.delete("/:id", deleteDiscount);

export default router;
