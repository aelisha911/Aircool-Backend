import express from "express";
import { getHomepage, saveHomepage } from "../controllers/homepageController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getHomepage);
router.put("/", requireAdmin, saveHomepage);

export default router;
