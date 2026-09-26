const express = require('express');
const router = express.Router();
const { getMyApplications, getCompanyApplications, updateStatus, getApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/my', protect, requireRole('student'), getMyApplications);
router.get('/company', protect, requireRole('company'), getCompanyApplications);
router.get('/:id', protect, getApplication);
router.put('/:id/status', protect, requireRole('company'), updateStatus);

module.exports = router;
