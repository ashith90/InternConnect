const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skillsRequired: [{ type: String }],
  stipend: { type: Number, default: 0 },
  duration: { type: String, required: true },
  deadline: { type: Date, required: true },
  domain: { type: String, default: '' },
  location: { type: String, default: 'Remote' },
  openings: { type: Number, default: 1 },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'active', 'closed'], default: 'pending' },
  isApprovedByAdmin: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
