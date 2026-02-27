require("dotenv").config();
const express = require("express");
const cors = require("cors");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- BREVO CONFIG -------------------- */
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* -------------------- HELPER FUNCTION -------------------- */
const getRecipients = () => {
  return process.env.RECEIVER_EMAIL
    .split(",")
    .map(email => ({ email: email.trim() }));
};

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

/* -------------------- TEST EMAIL ROUTE -------------------- */
// app.get("/test-email", async (req, res) => {
//   try {
//     const sendSmtpEmail = {
//       sender: {
//         name: "Abhishek",
//         email: process.env.SENDER_EMAIL
//       },
//       to: getRecipients(),
//       subject: "Brevo Multiple Email Test ✅",
//       htmlContent: "<h2>Email sent to multiple recipients 🚀</h2>"
//     };

//     const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);

//     console.log("Message ID:", response.messageId);
//     res.json({ message: "Email sent successfully ✅" });

//   } catch (error) {
//     console.error("FULL ERROR:", error.response?.body || error.message);
//     res.status(500).json({ message: "Failed to send email ❌" });
//   }
// });

/* -------------------- CONTACT FORM ROUTE -------------------- */
app.post("/contact", async (req, res) => {
  try {
    const { name, phone, email, date, message } = req.body;

    if (!name || !phone || !email || !date || !message) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const sendSmtpEmail = {
      sender: {
        name: name,
        email: process.env.SENDER_EMAIL
      },
      to: getRecipients(),
      replyTo: {
        email: email,
        name: name
      },
      subject: `New Contact Form - ${name}`,
      htmlContent: `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#247BBE;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f4f4f4; padding:10px; border-radius:5px;">
            ${message}
          </div>
        </div>
      `
    };

    await tranEmailApi.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: "Form submitted successfully ✅" });

  } catch (error) {
    console.error("CONTACT ERROR:", error.response?.body || error.message);
    res.status(500).json({ message: "Failed to send email ❌" });
  }
});

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Sender:", process.env.SENDER_EMAIL);
console.log("Receiver:", process.env.RECEIVER_EMAIL);
});