import axios from "axios";
import Contact from "../models/Contact.js";
import { sendContactEmail } from "./emailService.js";

export const sendEmail = async (req, res) => {
  try {
    const { name, email, phone, city, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ 1. Save to MongoDB
    const newContact = new Contact({
      name,
      email,
      phone,
      city,
      message,
    });

    await newContact.save();

    // ✅ 2. Send Email using service
    await sendContactEmail({
      name,
      email,
      mobile: phone,
      city,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Saved & Email Sent ✅",
    });

  } catch (error) {
    console.error("🔥 FULL ERROR:", error.response?.data || error.message || error);

    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Internal Server Error",
    });
  }
};