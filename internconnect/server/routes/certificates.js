const express = require('express');
const router = express.Router();
const { generate, download, verify, getMyCertificates } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/verify/:certificateId', verify);
router.get('/my', protect, requireRole('student'), getMyCertificates);
router.post('/:applicationId/generate', protect, requireRole('company', 'admin'), generate);
router.get('/:id/download', protect, download);

module.exports = router;
