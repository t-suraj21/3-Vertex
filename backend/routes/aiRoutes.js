const express = require('express');
const { parseResume } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/parse-resume', protect, authorize('student'), upload.single('resume'), parseResume);

module.exports = router;
