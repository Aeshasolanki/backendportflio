require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

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

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      replyTo: email,
      to: "siddharthdeveloperindia@gmail.com",
      subject: `New Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial; line-height: 1.6;">
          <h2>📩 New Inquiry Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
          <hr />
          <p style="font-size:12px;color:gray;">
            Sent from your portfolio contact form
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully");

    res.status(200).json({
      message: "Email sent successfully ✅",
    });

  } catch (error) {
    console.error("❌ Email error:", error);

    res.status(500).json({
      message: "Failed to send email ❌",
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
