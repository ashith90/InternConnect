const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (certData) => {
  const {
    studentName,
    companyName,
    internshipTitle,
    duration,
    certificateId,
    verificationUrl,
    outputPath,
  } = certData;

  return new Promise(async (resolve, reject) => {
    try {
      
      const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        errorCorrectionLevel: 'H',
        width: 120,
        margin: 1,
      });

      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const W = 841.89;
      const H = 595.28;

      
      doc.rect(0, 0, W, H).fill('#0f0c29');

      
      doc.rect(0, 0, W, H / 2).fill('#1a1040');
      doc.opacity(0.3).rect(0, 0, W, H).fill('#302b63').opacity(1);

      
      doc.rect(24, 24, W - 48, H - 48)
        .lineWidth(2)
        .strokeColor('#7c3aed')
        .stroke();
      doc.rect(30, 30, W - 60, H - 60)
        .lineWidth(0.5)
        .strokeColor('#a78bfa')
        .stroke();

      
      doc.moveTo(60, 80).lineTo(W - 60, 80).lineWidth(1).strokeColor('#7c3aed').stroke();

      
      doc.fontSize(11)
        .fillColor('#a78bfa')
        .font('Helvetica')
        .text('INTERNCONNECT', 0, 50, { align: 'center', characterSpacing: 4 });

      doc.fontSize(32)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('Certificate of Completion', 0, 95, { align: 'center' });

      
      doc.moveTo(250, 148).lineTo(W - 250, 148).lineWidth(1).strokeColor('#7c3aed').stroke();

      
      doc.fontSize(13)
        .fillColor('#c4b5fd')
        .font('Helvetica')
        .text('This is to certify that', 0, 170, { align: 'center' });

      doc.fontSize(28)
        .fillColor('#f5f3ff')
        .font('Helvetica-Bold')
        .text(studentName, 0, 196, { align: 'center' });

      doc.fontSize(13)
        .fillColor('#c4b5fd')
        .font('Helvetica')
        .text('has successfully completed the internship program', 0, 240, { align: 'center' });

      doc.fontSize(20)
        .fillColor('#a78bfa')
        .font('Helvetica-Bold')
        .text(`"${internshipTitle}"`, 0, 268, { align: 'center' });

      doc.fontSize(13)
        .fillColor('#c4b5fd')
        .font('Helvetica')
        .text(`at  ${companyName}  for a duration of  ${duration}`, 0, 305, { align: 'center' });

      
      doc.moveTo(60, 380).lineTo(W - 60, 380).lineWidth(0.5).strokeColor('#7c3aed').stroke();

      
      const issuedDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      
      doc.fontSize(10).fillColor('#a78bfa').font('Helvetica-Bold')
        .text('ISSUE DATE', 80, 400);
      doc.fontSize(12).fillColor('#ffffff').font('Helvetica')
        .text(issuedDate, 80, 415);

      
      doc.fontSize(9).fillColor('#6d28d9').font('Helvetica')
        .text(`Certificate ID: ${certificateId}`, 0, 418, { align: 'center' });

      
      doc.moveTo(W - 200, 430).lineTo(W - 80, 430).lineWidth(1).strokeColor('#7c3aed').stroke();
      doc.fontSize(10).fillColor('#a78bfa').font('Helvetica-Bold')
        .text('AUTHORIZED SIGNATORY', W - 220, 435);

      
      doc.image(qrBuffer, W - 180, 390, { width: 80, height: 80 });
      doc.fontSize(7).fillColor('#6d28d9').text('Scan to verify', W - 170, 474, { width: 60, align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateCertificate };
