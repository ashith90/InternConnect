const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  coverLetter: { type: String, default: '' },
  resume: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Completed'],
    default: 'Applied'
  },
  companyFeedback: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },

  // Transparent pipeline tracking
  timelineEvents: [{
    stage: { type: String },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  }],
  resumeViewCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date, default: null },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
