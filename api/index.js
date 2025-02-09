require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const axios = require("axios"); // Added for Brevo email API
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const app = express();
const PORT = 5000;

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const BREVO_API_KEY = process.env.BREVO_KEY;
const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json()); // Parse JSON body

function generateRandom4DigitNumber() {
  const uuidNumeric = uuidv4().replace(/\D/g, "");
  return uuidNumeric.slice(0, 4);
}

app.post("/send-sms", async (req, res) => {
  try {
    const { to, name, amount } = req.body;
    const personalizedMessage = `Thank You ${name}! Your donation of Rs.${amount} has been successfully received. -SHRI SAURASHTRA GURJAR SUTAR GNATI MANDAL MUMBAI`;

    const response = await client.messages.create({
      to,
      from: twilioNumber,
      body: personalizedMessage,
    });

    res.status(200).json({ success: true, sid: response.sid });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

function generateInvoice(invoiceData, filePath) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Set Gujarati Font Paths using __dirname
  const fontGujarati = path.join(__dirname, "NotoSansGujarati-VariableFont_wdth,wght.ttf");
  const fontBoldGujarati = path.join(__dirname, "AnekGujarati_SemiCondensed-Bold.ttf");
  const logoPath = path.join(__dirname, "logo.png");

  // Border Rectangle
  doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).lineWidth(5).strokeColor("orange").stroke();

  doc.font(fontGujarati);

  // Top Header
  doc.fontSize(12).text("|| શ્રી ગણેશાય નમઃ ||", 50, 20, { align: "left" });
  doc.text("|| શ્રી 1 ||", 50, 20, { align: "center" });
  doc.text("|| શ્રી વિશ્વકર્મણે નમઃ ||", 0, 20, { align: "right" });

  // Add Image if Exists
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 200, 40, { width: 185, height: 120 });
  }

  doc.font(fontBoldGujarati).fontSize(20).text("શ્રી સૌરાષ્ટ્ર ગુર્જર સુતાર જ્ઞાતિ મંડળ, મુંબઈ.", 50, 160, { align: "center", bold: true });
  doc.font(fontGujarati);
  doc.fontSize(10).text("(મુંબઈ પરા અને પુના વિભાગ રજિસ્ટર નં. ૨૭૦૫ A સ્થાપના ૧૯૬૩)", { align: "center" });

  doc.end();
  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

app.post("/send-email", async (req, res) => {
  try {
    const { to, donaterData } = req.body;
    console.log(donaterData);
    
    const pdfPath = path.join(__dirname, "receipt.pdf");
    await generateInvoice(donaterData, pdfPath);
    if (!to) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString("base64");

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Saurashtra Gurjar Sutar Mandal", email: "swayamzinzuwadia@gmail.com" },
        to: [{ email: to }],
        subject: "Donation Confirmation",
        htmlContent: "<p>Thank you for your donation!</p>",
        attachment: [{ name: "receipt.pdf", content: pdfBase64 }],
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
    res.status(500).json({ error: "Failed to send email", details: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
