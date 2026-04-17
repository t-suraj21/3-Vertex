const { createJob, getJobs, getJobById, getMyJobs, updateJob, deleteJob, applyJob } = require('../controllers/jobController');
const { toggleSaveJob } = require('../controllers/saveJobController');
const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getJobs);
router.get('/mine', protect, getMyJobs);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', protect, applyJob);
router.post('/save/:id', protect, toggleSaveJob);

module.exports = router;
