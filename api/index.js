require("dotenv").config();

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const axios = require("axios"); // Added for Brevo email API
const app = express();
const PORT = 5000;

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER; // Add your Twilio phone number in .env
const BREVO_API_KEY = process.env.BREVO_KEY;
const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json()); // Parse JSON body

// SMS sending endpoint
app.post("/send-sms", async (req, res) => {
  try {
    const { to, name, amount } = req.body;
    const personalizedMessage = `Thank You ${name}! Your donation of ₹${amount} has been successfully received. -SHRI SAURASHTRA GURJAR SUTAR GNATI MANDAL`;

    const response = await client.messages.create({
      to,
      from: twilioNumber,
      body: personalizedMessage,
    });

    res.status(200).json({ success: true, sid: response.sid });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Define a POST API endpoint to trigger the message
app.post("/send-message", (req, res) => {
  const { to, name, amount } = req.body;
  const personalizedMessage = `Hello ${name} Your donation of ₹${amount} has been successfully received. Thank You!`;

  // Send the message using Twilio API
  client.messages
    .create({
      from: "whatsapp:+18312082811", // Twilio sandbox WhatsApp number
      to: `whatsapp:+918879693624`, // Recipient's WhatsApp number (from JSON body)
      body: personalizedMessage, // Message to send (personalized)
      messagingServiceSid: "MG603308888211fb79ef5be5faac19128c",
    })
    .then((message) => {
      res
        .status(200)
        .send({ message: "Message sent successfully!", sid: message.sid });
    })
    .catch((error) => {
      res
        .status(500)
        .send({ error: `Error sending message: ${error.message}` });
    });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const sgMail = require("@sendgrid/mail");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Email sending endpoint using Brevo
app.post("/send-email", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // HTML Email Template
    const emailTemplate = `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donation Receipt</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
        }
        table {
            width: 100%;
            max-width: 600px;
            margin: auto;
            border-collapse: collapse;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        td {
            padding: 10px;
            text-align: center;
        }
        @media screen and (max-width: 600px) {
            td {
                padding: 15px;
            }
            img {
                width: 100%;
                height: auto;
            }
        }
    </style>
</head>
<body>
    <table cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td>
                <img src="https://firebasestorage.googleapis.com/v0/b/diosdamroo-b97a0.appspot.com/o/logo.png?alt=media&token=da43ea9d-ed3c-400a-b3f3-938e8933a142" alt="Logo">
            </td>
        </tr>
        <tr>
            <td style="font-size: 24px; font-weight: bold;">
                Thank You For Donating!
            </td>
        </tr>
        <tr>
            <td style="font-size: 18px;">
                This email is to notify that we have successfully received your donation<br>
                and have attached the receipt to this email.
            </td>
        </tr>
        <tr>
            <td style="font-size: 16px; font-weight: bold;">
                - SHRI GURJAR SUTAR MANDAL
            </td>
        </tr>
    </table>
</body>
</html>

    `;

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Saurashtra Gurjar Sutar Mandal",
          email: "swayamzinzuwadia@gmail.com",
        }, // Replace with your sender email
        to: [{ email: to }],
        subject: "Donation Confirmation",
        htmlContent: emailTemplate, // Inserted HTML template
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to send email",
      details: error.response?.data || error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
