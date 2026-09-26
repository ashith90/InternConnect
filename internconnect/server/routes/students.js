const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadResume, getProgress } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { uploadAvatar, uploadResume: uploadResumeMiddleware } = require('../middleware/upload');

router.use(protect, requireRole('student'));

router.get('/profile', getProfile);
router.put('/profile', uploadAvatar.single('profileImage'), updateProfile);
router.post('/profile/resume', uploadResumeMiddleware.single('resume'), uploadResume);
router.get('/progress', getProgress);

module.exports = router;
