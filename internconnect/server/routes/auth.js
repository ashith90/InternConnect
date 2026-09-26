const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, resubmitDocuments, getVerificationStatus } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadVerificationDocs } = require('../middleware/upload');

router.post('/register', uploadVerificationDocs.array('documents', 3), register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/resubmit-documents', uploadVerificationDocs.array('documents', 3), resubmitDocuments);
router.get('/verification-status', getVerificationStatus);

module.exports = router;
