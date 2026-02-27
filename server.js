require('dotenv').config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 8800;

app.use(cors());
app.use(express.json());


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Connection Error:", error);
    } else {
        console.log("SMTP Server is ready to send emails ✅");
    }
});


async function sendMail(name, mobile, email, date, message) {

    // drsushilgoel@gmail.com, mgoeldigitalmarketing@gmail.com
    const mailOptions = {
        from: process.env.EMAILID,
        to: "ac3137221@gmail.com",
        replyTo: email,
        subject: `Form Data - ${name}`,
        html: `
            <div style="font-family: Arial; padding:20px;">
                <h2 style="color:#247BBE;">New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Mobile:</strong> ${mobile}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Appointment Date:</strong> ${date}</p>
                <p><strong>Message:</strong></p>
                <p style="background:#f4f4f4; padding:10px;">${message}</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return true;
    } catch (error) {
        console.error("FULL Nodemailer Error:", error);
        return false;
    }
}

app.get("/", (req, res) => {
    res.send("Backend running successfully 🚀");
});

app.post("/contact", async (req, res) => {

    const { name, mobile, email, date, message } = req.body;

    if (!name || !mobile || !email || !date || !message) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const emailSent = await sendMail(name, mobile, email, date, message);

    if (emailSent) {
        return res.status(200).json({ message: "Form submitted successfully ✅" });
    } else {
        return res.status(500).json({ message: "Failed to send email. Check backend logs." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});