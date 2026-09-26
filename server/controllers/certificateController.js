const Certificate = require('../models/Certificate');
const Application = require('../models/Application');
const { generateCertificate } = require('../utils/generateCertificate');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');


const generate = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('studentId', 'name')
      .populate({ path: 'internshipId', populate: { path: 'companyId', select: 'companyName' } });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Internship must be marked as Completed first' });
    }

    const companyId = application.internshipId.companyId._id;
    if (companyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Already generated? Update scores if provided
    const existing = await Certificate.findOne({ applicationId: application._id });
    if (existing) {
      if (req.body.performanceScores) {
        existing.performanceScores = req.body.performanceScores;
        existing.overallRating = req.body.overallRating;
        existing.companyRemarks = req.body.companyRemarks || '';
        await existing.save();
      }
      return res.json({ success: true, certificate: existing, message: 'Certificate already generated' });
    }

    const certificateId = uuidv4();
    const verificationUrl = `${process.env.CLIENT_URL}/verify/${certificateId}`;
    const certDir = path.join(__dirname, '..', 'uploads', 'certificates');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
    const outputPath = path.join(certDir, `${certificateId}.pdf`);

    await generateCertificate({
      studentName: application.studentId.name,
      companyName: application.internshipId.companyId.companyName,
      internshipTitle: application.internshipId.title,
      duration: application.internshipId.duration,
      certificateId,
      verificationUrl,
      outputPath,
    });

    const certificate = await Certificate.create({
      studentId: application.studentId._id,
      companyId: companyId,
      internshipId: application.internshipId._id,
      applicationId: application._id,
      studentName: application.studentId.name,
      companyName: application.internshipId.companyId.companyName,
      internshipTitle: application.internshipId.title,
      duration: application.internshipId.duration,
      certificateId,
      verificationUrl,
      filePath: `/uploads/certificates/${certificateId}.pdf`,
      performanceScores: req.body.performanceScores || undefined,
      overallRating: req.body.overallRating || undefined,
      companyRemarks: req.body.companyRemarks || '',
    });

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const download = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });

    if (certificate.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const filePath = path.join(__dirname, '..', certificate.filePath);

    // If PDF file is missing on disk (e.g. after server restart / folder wipe),
    // regenerate it on-the-fly from the data stored in the DB record.
    if (!fs.existsSync(filePath)) {
      console.log(`[Certificate] File missing, regenerating: ${certificate.certificateId}`);
      const certDir = path.dirname(filePath);
      if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

      await generateCertificate({
        studentName: certificate.studentName,
        companyName: certificate.companyName,
        internshipTitle: certificate.internshipTitle,
        duration: certificate.duration,
        certificateId: certificate.certificateId,
        verificationUrl: certificate.verificationUrl,
        outputPath: filePath,
      });
    }

    res.download(filePath, `InternConnect_Certificate_${certificate.studentName}.pdf`);
  } catch (error) {
    console.error('[Certificate download]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const verify = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId });
    if (!certificate) return res.status(404).json({ success: false, message: 'Invalid certificate ID' });
    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ studentId: req.user._id })
      .populate('internshipId', 'title domain')
      .sort({ issuedAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generate, download, verify, getMyCertificates };
