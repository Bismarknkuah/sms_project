const PDFDocument = require('pdfkit');

async function createFinancialReportPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdf = Buffer.concat(buffers);
      resolve(pdf);
    });

    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.text(`Branch: ${data.branch}`);
    doc.text(`Generated At: ${data.generatedAt}`);

    doc.moveDown();
    doc.fontSize(14).text('Invoices:', { underline: true });
    data.invoices.forEach(inv => {
      doc.text(`Invoice: ${inv.description}, Amount: ₵${inv.amount}`);
    });

    doc.moveDown();
    doc.fontSize(14).text('Payments:', { underline: true });
    data.payments.forEach(pay => {
      doc.text(`Paid: ₵${pay.amount} via ${pay.method} on ${new Date(pay.date).toLocaleDateString()}`);
    });

    doc.end();
  });
}

module.exports = { createFinancialReportPDF };
