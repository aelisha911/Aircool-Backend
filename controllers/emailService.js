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

  const adminTemplateId = parseInt(process.env.BREVO_ADMIN_TEMPLATE_ID || "1", 10);
  const customerTemplateId = parseInt(process.env.BREVO_CUSTOMER_TEMPLATE_ID || "3", 10);

  const sendTemplateEmail = async (recipient, templateId) => {
    const requestBody = {
      sender: { email: process.env.EMAIL_USER, name: "AircoolDynamic" },
      to: [recipient],
      templateId,
      params: templateParams,
    };

    return retryWithBackoff(async () => {
      return axios.post(
        "https://api.brevo.com/v3/smtp/email",
        requestBody,
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY?.trim(),
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
    }, 3, 2000);
  };

  try {
    const [adminResponse, customerResponse] = await Promise.all([
      sendTemplateEmail({ email: recipientEmail }, adminTemplateId),
      sendTemplateEmail({ email, name }, customerTemplateId),
    ]);

    return {
      success: true,
      data: {
        admin: adminResponse.data,
        customer: customerResponse.data,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Brevo ERROR");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
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