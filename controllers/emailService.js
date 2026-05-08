import axios from "axios";

/**
 * Retry logic with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 2, initialDelay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`📧 Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Send contact email via Brevo API (Production-safe)
 */
const sendContactEmail = async (contactData) => {
  const { name, mobile, email, city, message } = contactData;

  const recipientEmail = process.env.EMAIL_TO || process.env.EMAIL_USER;

  // Canonical params for Brevo template (use in template as {{params.name}}, etc.)
  const templateParams = {
    NAME: name || "",
    EMAIL: email || "",
    PHONE: mobile || "",
    CITY: city || "",
    MESSAGE: message || "",
    // include lowercase keys too (some templates use {{params.name}})
    // name: name || "",
    // email: email || "",
    // phone: mobile || "",
    // city: city || "",
    // message: message || "",
  };

  console.log("📤 Sending Brevo template with params:", templateParams);

  try {
    const recipients = [
      { email: recipientEmail },
      { email: email, name: name },
    ];

 const requestBody = {
      sender: { email: process.env.EMAIL_USER, name: "AircoolDynamic" },
      to: recipients,
      templateId: parseInt(process.env.BREVO_TEMPLATE_ID) || 2,
      params: templateParams,
    };
    console.log("🔑 Sending request to Brevo with params:", JSON.stringify(requestBody, null, 2));

    const response = await retryWithBackoff(async () => {
      return await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        requestBody,
        {
          headers: { "api-key": process.env.BREVO_API_KEY?.trim(), "Content-Type": "application/json" },
          timeout: 30000,
        }
      );
    }, 3, 2000);
    
   

    console.log("📥 Brevo response:", response.data);

    return { success: true, data: response.data, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("❌ Email send error (full):", error.message);
    console.error("❌ Email send error (response body):", error.response?.data);
    throw error;
  }
};

/**
 * Escape HTML to prevent injection
 */
const escapeHtml = (text) => {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

export { sendContactEmail, escapeHtml };