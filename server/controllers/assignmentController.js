const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Internship = require('../models/Internship');
const Application = require('../models/Application');

// Helper: auto-resolve students assigned to an internship (Selected or Completed applicants)
const resolveAssignedStudents = async (internshipId, explicitIds = []) => {
  if (explicitIds.length > 0) return explicitIds;

  // Auto-assign to all selected/completed students for this internship
  const activeApps = await Application.find({
    internshipId,
    status: { $in: ['Selected', 'Completed', 'Interview', 'Assessment'] },
  }).select('studentId');

  return activeApps.map(a => a.studentId);
};

// ─── Company: Create Assignment ───────────────────────────────────────────────
const createAssignment = async (req, res) => {
  try {
    const { internshipId, title, description, deadline, maxScore, assignedTo } = req.body;

    // Verify internship belongs to this company
    const internship = await Internship.findOne({ _id: internshipId, companyId: req.user._id });
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found or unauthorized' });
    }

    // Resolve students: use explicit IDs if provided, else auto-populate from active applicants
    const studentIds = await resolveAssignedStudents(
      internshipId,
      Array.isArray(assignedTo) ? assignedTo.filter(Boolean) : []
    );

    if (studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active students found for this internship. Shortlist or select applicants first.',
      });
    }

    const assignment = await Assignment.create({
      internshipId,
      companyId: req.user._id,
      title,
      description,
      deadline,
      maxScore: maxScore || 100,
      assignedTo: studentIds,
    });

    res.status(201).json({
      success: true,
      assignment,
      assignedCount: studentIds.length,
      message: `Assignment created and assigned to ${studentIds.length} student(s).`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Student: Get My Assignments ──────────────────────────────────────────────
const getStudentAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ assignedTo: req.user._id })
      .populate('internshipId', 'title companyId duration')
      .populate('companyId', 'companyName logo name')
      .sort({ deadline: 1 });

    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (a) => {
        const submission = await Submission.findOne({
          assignmentId: a._id,
          studentId: req.user._id,
        });
        return { ...a.toObject(), submission: submission || null };
      })
    );

    res.json({ success: true, assignments: assignmentsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Company: Get All Assignments ─────────────────────────────────────────────
const getCompanyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ companyId: req.user._id })
      .populate('internshipId', 'title')
      .populate('assignedTo', 'name email profileImage college')
      .sort({ createdAt: -1 });

    // Attach submission counts
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const submissionCount = await Submission.countDocuments({ assignmentId: a._id });
        return { ...a.toObject(), submissionCount };
      })
    );

    res.json({ success: true, assignments: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Company: Get Active Students for an Internship (for manual assignment) ──
const getInternshipStudents = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const internship = await Internship.findOne({ _id: internshipId, companyId: req.user._id });
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    const apps = await Application.find({
      internshipId,
      status: { $in: ['Selected', 'Completed', 'Interview', 'Assessment', 'Shortlisted'] },
    }).populate('studentId', 'name email profileImage college skills');

    const students = apps.map(a => ({ ...a.studentId.toObject(), applicationStatus: a.status }));
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Student: Submit Assignment ───────────────────────────────────────────────
const submitAssignment = async (req, res) => {
  try {
    const { note, links } = req.body;

    // Parse links: can be a JSON string or array from form-data
    let parsedLinks = [];
    if (links) {
      try {
        parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;
        parsedLinks = parsedLinks.filter(l => l && l.url && l.url.trim());
      } catch {
        parsedLinks = [];
      }
    }

    const files = req.files
      ? req.files.map(f => ({
          filename: f.filename,
          originalname: f.originalname,
          path: `/uploads/assignments/${f.filename}`,
          mimetype: f.mimetype,
          size: f.size,
        }))
      : [];

    // Verify student is assigned to this assignment
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });
    if (!assignment) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this assignment.' });
    }

    const existing = await Submission.findOne({
      assignmentId: req.params.id,
      studentId: req.user._id,
    });

    if (existing) {
      existing.note = note || existing.note;
      existing.links = parsedLinks.length > 0 ? parsedLinks : existing.links;
      if (files.length) existing.files = [...existing.files, ...files];
      existing.status = 'Submitted';
      existing.submittedAt = Date.now();
      await existing.save();
      return res.json({ success: true, submission: existing, message: 'Submission updated successfully!' });
    }

    const submission = await Submission.create({
      assignmentId: req.params.id,
      studentId: req.user._id,
      note: note || '',
      files,
      links: parsedLinks,
      status: 'Submitted',
    });

    res.status(201).json({ success: true, submission, message: 'Assignment submitted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Company: Get All Submissions for an Assignment ───────────────────────────
const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate('studentId', 'name email profileImage college skills');
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Company: Review a Submission ─────────────────────────────────────────────
const reviewSubmission = async (req, res) => {
  try {
    const { status, feedback, score } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, feedback, score },
      { new: true }
    ).populate('studentId', 'name email');
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignment,
  getStudentAssignments,
  getCompanyAssignments,
  getInternshipStudents,
  submitAssignment,
  getSubmissions,
  reviewSubmission,
};
