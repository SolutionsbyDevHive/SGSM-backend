require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json()); // Parse JSON body

// Email sending endpoint
app.post("/send-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await resend.emails.send({
      from: "Saurashtra Gurjar Sutar Mandal <delivered@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="text-align: center; font-family: Arial, sans-serif;">
          <tr>
            <td style="padding: 20px;">
              <img src="https://firebasestorage.googleapis.com/v0/b/diosdamroo-b97a0.appspot.com/o/logo.png?alt=media&token=da43ea9d-ed3c-400a-b3f3-938e8933a142" 
                   width="400" height="280" 
                   alt="Logo" 
                   style="display: block; margin: 0 auto;">
            </td>
          </tr>
          <tr>
            <td>
              <h2 style="font-family: Arial, Helvetica, sans-serif;margin: 0;">Thank You For Donating!</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px;">
               <p style="text-align: center; font-size: larger; margin: 0;">This email is to notify that we have successfully received your donation<br>and have attached the receipt to this email</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px;">
              <h4>- SHRI GURJAR SUTAR MANDAL</h4>
            </td>
          </tr>
        </table>
      `,
    });

    if (error) {
      return res.status(500).json({ error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
