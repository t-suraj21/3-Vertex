const express = require('express');
const router = express.Router();
const { applyToJob, getStudentApplications, updateApplicationStatus, getCompanyApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/apply/:jobId', protect, authorize('student'), applyToJob);
router.get('/tracker', protect, authorize('student'), getStudentApplications);
router.get('/company', protect, authorize('company'), getCompanyApplications);
router.put('/status/:id', protect, authorize('company'), updateApplicationStatus);

module.exports = router;
