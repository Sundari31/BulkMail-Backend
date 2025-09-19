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

app.post("/sendemail", function (req, res) {
  const { msg, emailList } = req.body;

  credential.find().then(function () {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    })

    new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < emailList.length; i++) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emailList[i],
            subject: "A message from BulkMail App",
            text: msg
          })
          console.log("Email sent to: " + emailList[i])
        }
        resolve("Success")
      } catch (error) {
        console.error(error)
        reject("Failed")
      }
    }).then(() => {
      res.json({ success: true })   
      res.json({ success: false })  
    })
  }).catch(err => {
    console.error(err)
    res.json({ success: false })   
  })
})

app.get("/", (req, res) => {
  res.send("BulkMail backend is running ✅")
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
