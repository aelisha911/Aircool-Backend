import express from "express";
import upload from "../middleware/upload.js";

import {
  createDiscount,
  listDiscounts,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discountController.js";

const router = express.Router();

router.post("/", upload.any(), createDiscount);
router.get("/", listDiscounts);
router.put("/:id", upload.any(), updateDiscount);
router.delete("/:id", deleteDiscount);

export default router;