require("dotenv").config();

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
const PORT =  5000;

// Twilio Credentials
const accountSid =process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER; // Add your Twilio phone number in .env

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json()); // Parse JSON body

// SMS sending endpoint
app.post("/send-sms", async (req, res) => {
  try {
    const { to, name, amount } = req.body;
    const personalizedMessage = `Hello ${name} Your donation of ₹${amount} has been successfully received. Thank You!`;

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
  const { name, amount } = req.body
  const personalizedMessage = `Hello ${name} Your donation of ₹${amount} has been successfully received. Thank You!`;

  // Send the message using Twilio API
  client.messages
    .create({
      from: "whatsapp:+14155238886", // Twilio sandbox WhatsApp number
      to: 'whatsapp:+918879693624', // Recipient's WhatsApp number (from JSON body)
      body: personalizedMessage, // Message to send (personalized)
    })
    .then((message) => {
      res
        .status(200)
        .send({ message: "Message sent successfully!", sid: message.sid });
    })
    .catch((error) => {
      res
        .status(500)
        .send({ error: 'Error sending message: ${error.message}' });
    });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;