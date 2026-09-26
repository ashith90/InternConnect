const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getStudentAssignments,
  getCompanyAssignments,
  getInternshipStudents,
  submitAssignment,
  getSubmissions,
  reviewSubmission,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { uploadAssignment } = require('../middleware/upload');

// Company routes
router.post('/', protect, requireRole('company'), createAssignment);
router.get('/company', protect, requireRole('company'), getCompanyAssignments);
router.get('/internship/:internshipId/students', protect, requireRole('company'), getInternshipStudents);
router.get('/:id/submissions', protect, requireRole('company'), getSubmissions);
router.put('/submissions/:id', protect, requireRole('company'), reviewSubmission);

// Student routes
router.get('/student', protect, requireRole('student'), getStudentAssignments);
router.post('/:id/submit', protect, requireRole('student'), uploadAssignment.array('files', 5), submitAssignment);

module.exports = router;
