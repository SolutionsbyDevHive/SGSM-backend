const PDFDocument = require("pdfkit");
const fs = require("fs");

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
  doc.font("./NotoSansGujarati-VariableFont_wdth,wght.ttf");

  // Top Header
  doc.fontSize(12);
  doc.text("|| શ્રી ગણેશાય નમઃ ||", 50, 20, { align: "left" });
  doc.text("|| શ્રી 1 ||", 50, 20, { align: "center" });
  doc.text("|| શ્રી વિશ્વકર્મણે નમઃ ||", 0, 20, { align: "right" });

  // Add Image (Make sure the file exists)
  if (fs.existsSync("./logo.png")) {
    doc.image("./logo.png", 200, 40, { width: 185, height: 120 });
  }

  // Centralized Header Text
  doc
    .font("./AnekGujarati_SemiCondensed-Bold.ttf")
    .fontSize(20)
    .text("શ્રી સૌરાષ્ટ્ર ગુર્જર સુતાર જ્ઞાતિ મંડળ, મુંબઈ.", 50, 160, {
      align: "center",
      bold: true,
    });
  doc.font("./NotoSansGujarati-VariableFont_wdth,wght.ttf");
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
    .text(invoiceData.invoiceNumber || "", rightColumnX + 50, currentY + 35);
  doc
    .text("તારીખ:", rightColumnX, currentY + 15)
    .text(invoiceData.date || "", rightColumnX + 50, currentY + 15);
  currentY += rowHeight;
  doc
    .text("શ્રી:", leftColumnX, currentY)
    .text(invoiceData.recipientName || "", leftColumnX + 30, currentY);
  doc.text("8879699312" || "", leftColumnX + 30, currentY + 17);
  doc.text("email@gmail.com" || "", leftColumnX + 30, currentY + 35);
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

  // Table Rows
  currentY += 60;
  if (Array.isArray(invoiceData.items)) {
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
    invoiceData.items.forEach((item, index) => {
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
        .text(`${index + 1}`, tableStartX + 5, currentRowY + 7) // Sr. No
        .text(item.name, tableStartX + columnWidths[0] + 5, currentRowY + 7) // Item Name
        .text(
          `₹${item.price.toFixed(2)}`,
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
        `₹${invoiceData.items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}`,
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

// Example Invoice Data
const invoiceData = {
  invoiceNumber: "1117",
  date: "૧૨-ફેબ્રુઆરી-૨૦૨૫",
  recipientName: "શ્રી જયન્તીલાલ",
  village: "રાજકોટ",
  items: [
    { name: "સંસ્થાના ઉછેર અને મફતીફંડ", price: 500 },
    { name: "શ્રી કપલેટી ફંડ", price: 300 },
    { name: "દશમો (જાતે)", price: 200 },
    { name: "શ્રી ગોલક ફંડ", price: 400 },
  ],
};

// Generate Invoice
generateInvoice(invoiceData, "invoice.pdf");
console.log("Gujarati Invoice PDF generated successfully!");