const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()

app.use(express.json())

app.use(cors({
  origin:  'https://bulk-mail-frontend-xkyo.vercel.app', 
  methods: ['GET','POST'],
  credentials: true
}))

mongoose.connect(process.env.MONGO_URI)
    .then(function () {
        console.log("Connected to DB")
    }).catch(function () {
        console.log("Failed to Connect")
    })

const credential = mongoose.model("credential", {}, "bulkmail")

// app.post("/sendemail", function (req, res) {
//     var msg = req.body.msg
//     var emailList = req.body.emailList

//     credential.find().then(function (data) {

//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             }
//         })

//         new Promise(async function (resolve, reject) {
//             try {
//                 for (var i = 0; i < emailList.length; i++) {
//                     await transporter.sendMail(
//                         {
//                             from: "sundarimuthaiah2004@gmail.com",
//                             to: emailList[i],
//                             subject: "A message from BulkMail App",
//                             text: msg
//                         }
//                     )
//                     console.log("Email sent to:" + emailList[i])
//                 }
//                 resolve("Success")
//             }
//             catch (error) {
//                 reject("Failed")
//             }
//         }).then(function () {
//             res.send(true)
//         }).catch(function () {
//             res.send(false)
//         })

//     }).catch(function (error) {
//         console.log(error)
//     })

// })

app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    // make sure DB connection works
    await credential.find();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailList[i],
        subject: "A message from BulkMail App",
        text: msg
      });
      console.log("✅ Email sent to:", emailList[i]);
    }

    res.json({ success: true, message: "All emails sent!" });
  } catch (err) {
    console.error("❌ Error sending emails:", err);
    res.status(500).json({ success: false, message: "Failed to send emails" });
  }
});

app.get("/", (req, res) => {
  res.send("BulkMail backend is running ✅")
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
