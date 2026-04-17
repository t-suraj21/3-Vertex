const express = require('express');
const { getPendingVerifications, updateVerificationStatus, getReports, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and Admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/verifications', getPendingVerifications);
router.put('/verifications/:id', updateVerificationStatus);
router.get('/reports', getReports);
router.get('/analytics', getAnalytics);

module.exports = router;
