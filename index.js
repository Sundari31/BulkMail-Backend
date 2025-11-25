const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ FIXED CORS (Correct Vercel domain)
app.use(cors({
  origin: [
    "https://bulk-mail-frontend-five.vercel.app",   // NEW DOMAIN
    "https://bulk-mail-frontend-ftuz.vercel.app"    // OLD DOMAIN
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB"))
  .catch(() => console.log("Failed to connect to DB"));

const credential = mongoose.model("credential", {}, "bulkmail");

// ✅ FIXED MAIL ROUTE (working, clean, single response)
app.post("/sendemail", async (req, res) => {
  console.log("Incoming request:", req.body);

  const { msg, emailList } = req.body;

  try {
    await credential.find();  // DB check

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // Loop through email list and send emails
    for (let email of emailList) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "A message from BulkMail App",
        text: msg
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
