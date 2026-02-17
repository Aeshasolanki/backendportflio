require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://siddharthmakadiyasite.web.app",
  "https://siddharthmakadiyasite.firebaseapp.com",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("/send-email", cors(corsOptions));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: { ciphers: "TLSv1.2" },
});

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// Send email route
app.post("/send-email", async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Validation
  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const html = `
    <div style="font-family: Arial; line-height: 1.6;">
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
      <hr />
      <p style="font-size:12px;color:gray;">Sent from your portfolio contact form</p>
    </div>
  `;

  try {
    if (resend) {
      await resend.emails.send({
        from: "Portfolio <onboarding@resend.dev>",
        to: "siddharthdeveloperindia@gmail.com",
        reply_to: email,
        subject: `📩 New Inquiry from ${name}`,
        html,
      });
    } else {
      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
        replyTo: email,
        to: "siddharthdeveloperindia@gmail.com",
        subject: `📩 New Inquiry from ${name}`,
        html,
      });
    }

    console.log("✅ Email sent successfully");

    res.status(200).json({
      message: "Email sent successfully ✅",
    });

  } catch (error) {
    console.error("❌ Email error:", error);

    res.status(500).json({
      message: "Failed to send email ❌",
      error: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
