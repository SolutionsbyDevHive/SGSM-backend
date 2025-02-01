// require("dotenv").config();
// const axios = require("axios");

// const sendSMS = async (amount) => {
//   try {
//     // Fast2SMS API URL
//     const apiUrl = "https://www.fast2sms.com/dev/api/"

//     // Replace with your actual Fast2SMS API key
//     const apiKey = process.env.FAST2SMS_API_KEY;
    
//     const phoneNumber = "8879693624";  // Replace with the actual phone number

//     // Construct the message with the dynamic amount
//     const message = `We have successfully received a donation of ₹${amount}. Thank You`;

//     // Fast2SMS API request configuration
//     const response = await axios.post(apiUrl + "send", null, {
//       params: {
//         authorization: apiKey,
//         message: message,
//         language: "english",
//         route: "p",
//         numbers: phoneNumber,
//       },
//     });

//     if (response.data) {
//       console.log("SMS sent successfully:", response.data);
//     } else {
//       console.log("Failed to send SMS:", response);
//     }
//   } catch (error) {
//     console.error("Error sending SMS:", error.message);
//   }
// };

// // Example usage: Send SMS with amount of ₹500
// sendSMS(500);
