const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateInvoice(invoiceData, filePath) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Set Gujarati font
  doc.font("./NotoSansGujarati-VariableFont_wdth,wght.ttf");

  // Top Header - Align phrases properly
  doc.fontSize(12);
  doc.text("|| શ્રી ગણેશાય નમઃ ||", 50, 20, { align: "left" });
  doc.text("|| શ્રી 1||", 0, 20, { align: "center" });
  doc.text("|| શ્રી વિષ્ણવે નમઃ ||", 0, 20, { align: "right" });
  doc.image('./logo.png', 20, 40, { width: 200, height: 120 });

  doc.moveDown(2);
  doc.fontSize(16).text("શ્રી સૌરાષ્ટ્ર ગુર્જર સુતાર જ્ઞાતિ મંડળ, મુંબઈ.", { align: "right", bold: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text("(મુંબઈ પરા અને પુના વિભાગ રજિસ્ટર નં. ૨૭૦૫ A સ્થાપના ૧૯૬૩)", { align: "right" });
  doc.moveDown(0.3);
  doc.text("સી. ડી. હાઈટ, બિલ્ડિંગ નં. ૩, બી વિંગ, ૧૧૮ પેલા માળે, લક્ષ્મીનારાયણ મંદિર ની સામે,", { align: "right" });
  doc.text("રાણી સતી માર્ગ, મલાડ (પૂર્વ), મુંબઈ - ૪૦૦૦૯૭.", { align: "right" });
  doc.moveDown(1);

  // Invoice Number and Date Section
  doc.fontSize(12);
  const leftColumnX = 50;
  const rightColumnX = 350;
  const rowHeight = 20;
  let currentY = 170;

  doc.text("ક્રમાંક:", leftColumnX, currentY).text(invoiceData.invoiceNumber || "________", leftColumnX + 70, currentY);
  doc.text("તારીખ:", rightColumnX, currentY).text(invoiceData.date || "________", rightColumnX + 50, currentY);
  currentY += rowHeight;
  doc.text("શ્રી:", leftColumnX, currentY).text(invoiceData.recipientName || "____________________________", leftColumnX + 70, currentY);
  doc.text("ગામ:", rightColumnX, currentY).text(invoiceData.village || "____________________________", rightColumnX + 50, currentY);

  // Descriptions Section
  currentY += rowHeight + 10;
  doc.text("તમારા તરફથી શું:", leftColumnX, currentY);
  doc.text("આપનો લખાયેલો હિસાબ અહીં છે:", rightColumnX, currentY);

  // Table Header
  const tableTop = currentY + 30;
  const columnPositions = [50, 300, 350, 450];

  doc.fontSize(12)
    .text("વિગત", columnPositions[0], tableTop, { underline: true })
    .text("કુલ રકમ", columnPositions[3], tableTop, { align: "center", underline: true });

  // Table Rows
  currentY = tableTop + 20;
  invoiceData.items.forEach((item, index) => {
    const y = currentY;

    // Draw row text
    doc.text(`${index + 1}) ${item.name}`, columnPositions[0], y);
    doc.text(`₹${item.price.toFixed(2)}`, columnPositions[3], y, { align: "right" });

    currentY += rowHeight;
  });

  // Footer Section
  currentY += 30;
  doc.text("શ્રી વાલાપર માસ: _______________ થી ______________", leftColumnX, currentY);
  currentY += rowHeight;
  doc.text("શ્રી સૌરાષ્ટ્ર ગુર્જર સુતાર પ્રાપ્તિ મંડળ, મુંબઈ.", { align: "center", bold: true });

  // Finalize the PDF
  doc.end();
}

// Example Invoice Data
const invoiceData = {
  invoiceNumber: "1117",
  date: "________",
  recipientName: "શ્રી જયન્તીલાલ",
  village: "રાજકોટ",
  items: [
    { name: "સંસ્થાના ઉછેર અને મફતીફંડ", quantity: 1, price: 500 },
    { name: "શ્રી કપલેટી ફંડ", quantity: 1, price: 300 },
    { name: "દશમો (જાતે)", quantity: 1, price: 200 },
    { name: "શ્રી ગોલક ફંડ", quantity: 1, price: 400 },
  ],
};

// Generate Invoice
generateInvoice(invoiceData, "receipt.pdf");
console.log("Gujarati Invoice PDF generated successfully!");



// index.js backup

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const axios = require("axios"); // Added for Brevo email API
const app = express();
const PORT = 5000;
const PDFDocument = require("pdfkit");
const fs = require("fs");
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
    const personalizedMessage = `Thank You ${name}! Your donation of Rs.${amount} has been successfully received. -SHRI SAURASHTRA GURJAR SUTAR GNATI MANDAL`;

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
  const personalizedMessage = `Hello ${name} Your donation of Rs.${amount} has been successfully received. Thank You!`;

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

function generateInvoice(invoiceData, filePath) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Border Rectangle
  doc
    .rect(10, 10, doc.page.width - 20, doc.page.height - 20)
    .lineWidth(5)
    .strokeColor("orange")
    .stroke();

  // Set Gujarati Font
  doc.font("../NotoSansGujarati-VariableFont_wdth,wght.ttf");

  // Top Header
  doc.fontSize(12);
  doc.text("|| શ્રી ગણેશાય નમઃ ||", 50, 20, { align: "left" });
  doc.text("|| શ્રી 1 ||", 50, 20, { align: "center" });
  doc.text("|| શ્રી વિશ્વકર્મણે નમઃ ||", 0, 20, { align: "right" });

  // Add Image (Make sure the file exists)
  if (fs.existsSync("../logo.png")) {
    doc.image("../logo.png", 200, 40, { width: 185, height: 120 });
  }

  // Centralized Header Text
  doc
    .font("../AnekGujarati_SemiCondensed-Bold.ttf")
    .fontSize(20)
    .text("શ્રી સૌરાષ્ટ્ર ગુર્જર સુતાર જ્ઞાતિ મંડળ, મુંબઈ.", 50, 160, {
      align: "center",
      bold: true,
    });
  doc.font("../NotoSansGujarati-VariableFont_wdth,wght.ttf");
  doc
    .fontSize(10)
    .text("(મુંબઈ પરા અને પુના વિભાગ રજિસ્ટર નં. ૨૭૦૫ A સ્થાપના ૧૯૬૩)", {
      align: "center",
    });
  doc
    .text(
      "સી. ડી. હાઈટ, બિલ્ડિંગ નં. ૩, બી વિંગ, ૧૧૮ પેલા માળે, લક્ષ્મીનારાયણ મંદિર ની સામે,",
      { align: "center" }
    )
    .text("રાણી સતી માર્ગ, મલાડ (પૂર્વ), મુંબઈ - ૪૦૦૦૯૭.", { align: "center" });

  // Invoice Details
  doc.fontSize(12);
  const leftColumnX = 50;
  const rightColumnX = 380;
  const rowHeight = 20;
  let currentY = 220;

  doc
    .text("ક્રમાંક:", rightColumnX, currentY + 35)
    .text(invoiceData.invoiceNumber, rightColumnX + 50, currentY + 35);
  doc
    .text("તારીખ:", rightColumnX, currentY + 15)
    .text(invoiceData.date || "", rightColumnX + 50, currentY + 15);
  currentY += rowHeight;
  doc
    .text("શ્રી:", leftColumnX, currentY)
    .text(invoiceData.name || "", leftColumnX + 30, currentY);
  doc.text(invoiceData.number || "", leftColumnX + 30, currentY + 17);
  doc.text(invoiceData.email || "", leftColumnX + 30, currentY + 35);
  doc
    .text("ગામ:", rightColumnX, currentY + 35)
    .text(invoiceData.village || "", rightColumnX + 50, currentY + 35);

  // Description Section
  currentY += rowHeight + 10;
  // doc.text("તમારા તરફથી શું:", leftColumnX, currentY);
  // doc.text("વિગત", leftColumnX, currentY + 40, { underline: true });
  // doc.text("કુલ રકમ", rightColumnX + 100, currentY + 40, {
  // align: "right",
  // underline: true,
  // });

  // // Table Rows
  // currentY += 60;
  // if (Array.isArray(invoiceData.items)) {
  //   // Define table column positions
  //   const tableStartX = leftColumnX; // Starting X position for the table
  //   const tableStartY = currentY; // Starting Y position for the table
  //   const columnWidths = [50, 325, 125]; // Widths for each column: Sr. No, Item Name, Price
  //   const rowHeight = 25; // Height of each row

  //   // Set stroke color to black for the table
  //   doc.strokeColor("black").lineWidth(2);

  //   // Draw table header
  //   doc
  //     .rect(
  //       tableStartX,
  //       tableStartY,
  //       columnWidths.reduce((a, b) => a + b),
  //       rowHeight
  //     )
  //     .stroke(); // Header row border
  //   doc
  //     .text("ક્રમ", tableStartX + 5, tableStartY + 7)
  //     .text("વિગત", tableStartX + columnWidths[0] + 5, tableStartY + 7)
  //     .text(
  //       "કુલ રકમ",
  //       tableStartX + columnWidths[0] + columnWidths[1] + 5,
  //       tableStartY + 7
  //     );

  //   // Draw table rows for items
  //   let currentRowY = tableStartY + rowHeight; // First row Y position
  //   Object.entries(invoiceData.amounts).forEach(([key, value], index) => {
  //     const amount = Number(value) || 0; // Convert string to number
    
  //     // Draw row border
  //     doc
  //       .rect(
  //         tableStartX,
  //         currentRowY,
  //         columnWidths.reduce((a, b) => a + b),
  //         rowHeight
  //       )
  //       .stroke();
    
  //     // Add text for each column
  //     doc
  //       .text(`${index + 1}`, tableStartX + 5, currentRowY + 7) // Serial Number
  //       .text(key, tableStartX + columnWidths[0] + 5, currentRowY + 7) // Item Name
  //       .text(
  //         `₹${amount.toFixed(2)}`,
  //         tableStartX + columnWidths[0] + columnWidths[1] + 5,
  //         currentRowY + 7
  //       ); // Price
    
  //     currentRowY += rowHeight; // Move to the next row
  //   });
    
    

  //   // Draw total amount row
  //   doc
  //     .rect(
  //       tableStartX,
  //       currentRowY,
  //       columnWidths.reduce((a, b) => a + b),
  //       rowHeight
  //     )
  //     .stroke();
  //   doc
  //     .fontSize(12)
  //     .text("કુલ રકમ", tableStartX + columnWidths[0] + 5, currentRowY + 7)
  //     .text(
  //       `₹${invoiceData.amounts.reduce((sum, i) => sum + i.price, 0).toFixed(2)}`,
  //       tableStartX + columnWidths[0] + columnWidths[1] + 5,
  //       currentRowY + 7
  //     );

  //   // Update currentY to the end of the table
  //   currentY = currentRowY + rowHeight;
  // }

  // Table Rows
currentY += 60;
if (invoiceData.amounts && typeof invoiceData.amounts === "object") {
  // Define table column positions
  const tableStartX = leftColumnX; // Starting X position for the table
  const tableStartY = currentY; // Starting Y position for the table
  const columnWidths = [50, 325, 125]; // Widths for each column: Sr. No, Item Name, Price
  const rowHeight = 25; // Height of each row

  // Set stroke color to black for the table
  doc.strokeColor("black").lineWidth(2);

  // Draw table header
  doc
    .rect(
      tableStartX,
      tableStartY,
      columnWidths.reduce((a, b) => a + b),
      rowHeight
    )
    .stroke(); // Header row border
  doc
    .text("ક્રમ", tableStartX + 5, tableStartY + 7)
    .text("વિગત", tableStartX + columnWidths[0] + 5, tableStartY + 7)
    .text(
      "કુલ રકમ",
      tableStartX + columnWidths[0] + columnWidths[1] + 5,
      tableStartY + 7
    );

  // Draw table rows for items
  let currentRowY = tableStartY + rowHeight; // First row Y position
  let totalAmount = 0; // To track total

  Object.entries(invoiceData.amounts).forEach(([key, value], index) => {
    const amount = Number(value) || 0; // Convert string to number
    totalAmount += amount; // Add to total sum

    // Draw row border
    doc
      .rect(
        tableStartX,
        currentRowY,
        columnWidths.reduce((a, b) => a + b),
        rowHeight
      )
      .stroke();

    // Add text for each column
    doc
      .text(`${index + 1}`, tableStartX + 5, currentRowY + 7) // Serial Number
      .text(key, tableStartX + columnWidths[0] + 5, currentRowY + 7) // Item Name
      .text(
        `₹${amount.toFixed(2)}`,
        tableStartX + columnWidths[0] + columnWidths[1] + 5,
        currentRowY + 7
      ); // Price

    currentRowY += rowHeight; // Move to the next row
  });

  // Draw total amount row
  doc
    .rect(
      tableStartX,
      currentRowY,
      columnWidths.reduce((a, b) => a + b),
      rowHeight
    )
    .stroke();
  doc
    .fontSize(12)
    .text("કુલ રકમ", tableStartX + columnWidths[0] + 5, currentRowY + 7)
    .text(
      `₹${totalAmount.toFixed(2)}`,
      tableStartX + columnWidths[0] + columnWidths[1] + 5,
      currentRowY + 7
    );

  // Update currentY to the end of the table
  currentY = currentRowY + rowHeight;
}





  // Footer Section
  currentY += 50;
  currentY += rowHeight;
  doc.text("શ્રી સૌરાષ્ટ્ર ગુર્જર સુતાર પ્રાપ્તિ મંડળ, મુંબઈ.", 0, 530, {
    align: "right",
    bold: true,
  });

  // Finalize the PDF
  doc.end();
}
// Email sending endpoint using Brevo
app.post("/send-email", async (req, res) => {
  try {
    const { to, donaterData } = req.body;
    console.log(donaterData);
    generateInvoice(donaterData, "receipt.pdf");
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

    // const pdfPath = "./receipt.pdf";

    // // Check if the file exists before proceeding
    // if (!fs.existsSync(pdfPath)) {
    //   throw new Error("PDF file not found at " + pdfPath);
    // }

    const path = require("path");
    const pdfPath = path.join(__dirname, "receipt.pdf");
    // Read the PDF file and convert it to Base64
    const pdfBuffer = fs.readFileSync(pdfPath); // Read file
    const pdfBase64 = pdfBuffer.toString("base64"); // Convert to Base64

    // Ensure the Base64 string is properly created
    if (!pdfBase64) {
      throw new Error("Failed to encode PDF to Base64");
    }

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
        attachment: [
          {
            name: "receipt.pdf", // File name
            content: pdfBase64, // Base64 encoded content
          },
        ],
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
