const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  studentName: { type: String, required: true },
  companyName: { type: String, required: true },
  internshipTitle: { type: String, required: true },
  duration: { type: String, required: true },
  certificateId: { type: String, unique: true, required: true },
  verificationUrl: { type: String, required: true },
  filePath: { type: String, default: '' },
  issuedAt: { type: Date, default: Date.now },

  // Performance evaluation (Phase 3 - filled by company before issuing)
  performanceScores: {
    technicalSkills: { type: Number, min: 0, max: 100, default: null },
    problemSolving: { type: Number, min: 0, max: 100, default: null },
    communication: { type: Number, min: 0, max: 100, default: null },
    teamCollaboration: { type: Number, min: 0, max: 100, default: null },
    taskCompletion: { type: Number, min: 0, max: 100, default: null },
  },
  overallRating: { type: Number, min: 0, max: 100, default: null },
  companyRemarks: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
