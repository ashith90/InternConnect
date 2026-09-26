const express = require('express');
const router = express.Router();
const {
  getInternships, getInternship, createInternship, updateInternship,
  deleteInternship, applyInternship, getCompanyInternships
} = require('../controllers/internshipController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');


// Public routes
router.get('/', getInternships);

// Specific named routes MUST come before parameterized /:id routes
router.get('/company/mine', protect, requireRole('company'), getCompanyInternships);
router.post('/', protect, requireRole('company'), createInternship);

// Parameterized routes
router.get('/:id', getInternship);
router.post('/:id/apply', protect, requireRole('student'), applyInternship);
router.put('/:id', protect, requireRole('company'), updateInternship);
router.delete('/:id', protect, requireRole('company'), deleteInternship);

module.exports = router;
