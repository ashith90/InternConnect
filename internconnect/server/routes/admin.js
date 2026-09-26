const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, toggleUser, getAllInternships,
  updateInternshipStatus, deleteDiscussion, getAllCertificates,
  getPendingVerifications, reviewVerification,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/internships', getAllInternships);
router.put('/internships/:id/approve', updateInternshipStatus);
router.delete('/discussions/:id', deleteDiscussion);
router.get('/certificates', getAllCertificates);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:id/review', reviewVerification);

module.exports = router;
