const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateInvoice(invoiceData, filePath) {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe the document to a file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  // Invoice Details
  doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceNumber}`);
  doc.text(`Date: ${invoiceData.date}`);
  doc.text(`Due Date: ${invoiceData.dueDate}`);
  doc.moveDown();

  // Sender & Recipient Details
  doc.text(`From: ${invoiceData.sender.name}`);
  doc.text(`Address: ${invoiceData.sender.address}`);
  doc.text(`Email: ${invoiceData.sender.email}`);
  doc.moveDown();

  doc.text(`To: ${invoiceData.recipient.name}`);
  doc.text(`Address: ${invoiceData.recipient.address}`);
  doc.text(`Email: ${invoiceData.recipient.email}`);
  doc.moveDown();

  // Table Header with precise alignment
  doc.moveDown();
  doc.fontSize(12).text("Particulars", 50, 275);
  //   doc.text("Quantity", 250, 275);

  doc.text("Amount", 450, 275);
  doc.moveDown();

  // Table Rows with aligned columns
  let totalAmount = 0;
  invoiceData.items.forEach((item) => {
    const y = doc.y; // Capture the current y position for the row

    doc.text(item.name, 50, y); // Item name at column 1
    // doc.text(item.quantity.toString(), 250, y); // Quantity at column 2
    // doc.text(`$${item.price.toFixed(2)}`, 350, y); // Price at column 3
    doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 450, y); // Total at column 4

    totalAmount += item.quantity * item.price;
    doc.moveDown(); // Move to the next row
  });

  // Total Amount Section
  doc.moveDown();
  doc
    .fontSize(14)
    .text(`Total Amount: $${totalAmount.toFixed(2)}`, { align: "right" });

  // Footer
  doc.moveDown();
  doc.fontSize(10).text("Thank you for your business!", { align: "center" });

  // Finalize the PDF
  doc.end();
}

// Example Invoice Data
const invoiceData = {
  invoiceNumber: "INV-12345",
  date: "2025-02-05",
  dueDate: "2025-02-20",
  sender: {
    name: "Your Company",
    address: "123 Street, City",
    email: "your@email.com",
  },
  recipient: {
    name: "Client Name",
    address: "456 Avenue, City",
    email: "client@email.com",
  },
  items: [
    { name: "Web Development", quantity: 1, price: 500.0 },
    { name: "Hosting", quantity: 1, price: 800.0 },
    { name: "Domain", quantity: 1, price: 20.0 },
  ],
};

// Generate Invoice
generateInvoice(invoiceData, "invoice.pdf");
console.log("Invoice PDF generated successfully!");
