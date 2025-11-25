const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// 💡 IMPORTANT: Allow preflight OPTIONS request
app.options("*", cors());

// ✔ Correct CORS for your real frontend domain
app.use(
  cors({
    origin: [
      "https://bulk-mail-frontend-five.vercel.app" // your current live frontend
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Failed to connect:", err));

const credential = mongoose.model("credential", {}, "bulkmail");

// 📩 Email sending route
app.post("/sendemail", async (req, res) => {
  console.log("Incoming request:", req.body);

  const { msg, emailList } = req.body;

  try {
    // Nodemailer config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send emails one by one
    for (let email of emailList) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "A message from BulkMail App",
        text: msg,
      });

      console.log("Email sent to:", email);
    }

    // Send only ONE response
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.json({ success: false });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("BulkMail backend is running ✅");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
