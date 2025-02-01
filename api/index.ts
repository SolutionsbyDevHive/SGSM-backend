require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 5000;

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER; // Add your Twilio phone number in .env

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json()); // Parse JSON body

// SMS sending endpoint
app.post("/send-sms", async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await client.messages.create({
      to,
      from: twilioNumber,
      body: message,
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
  // Destructure the required parameters from the request body
  const { to, contentSid, contentVariables, name } = req.body;

  // Validate input
  if (!to || !contentSid || !contentVariables || !name) {
    return res
      .status(400)
      .send(
        "Missing required fields (to, contentSid, contentVariables, name)."
      );
  }

  // Craft a personalized message using the provided name
  const personalizedMessage = `Hello ${name}. Thank you for donating at SGSM.`;

  // Send the message using Twilio API
  client.messages
    .create({
      from: "whatsapp:+14155238886", // Twilio sandbox WhatsApp number
      to: `whatsapp:${to}`, // Recipient's WhatsApp number (from JSON body)
      contentSid: contentSid, // Content SID (from JSON body)
      body: personalizedMessage, // Personalized message with the dynamic name
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

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

module.exports = app;
