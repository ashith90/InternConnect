const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxScore: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
