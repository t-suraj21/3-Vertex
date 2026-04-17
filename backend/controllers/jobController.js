const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Create Job Post (Only Verified Companies)
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    // Role & Verification Guard
    if (req.user.role !== 'company') {
      return res.status(403).json({ success: false, error: 'Only companies can post jobs' });
    }

    const company = await User.findById(req.user.id);
    if (company.verifiedStatus !== 'verified') {
      return res.status(403).json({ success: false, error: 'Your company data is currently unverified. Cannot post jobs.' });
    }

    const job = await Job.create({
      ...req.body,
      companyId: req.user.id
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error('Job Creation Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Get All Jobs (Public/Student)
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.search) {
      filters.title = { $regex: req.query.search, $options: 'i' };
    }
    const jobs = await Job.find(filters).populate('companyId', 'companyName verifiedStatus').sort('-createdAt');
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get Jobs Posted By This Company
// @route   GET /api/jobs/mine
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update Job
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    // Make sure user owns job
    if (job.companyId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete Job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    if (job.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await job.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Apply Job
// @route   POST /api/jobs/:id/apply
exports.applyJob = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can apply' });
    }

    // Check if already applied
    const existing = await Application.findOne({ studentId: req.user.id, jobId: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Already applied for this job' });
    }

    const application = await Application.create({
      studentId: req.user.id,
      jobId: req.params.id,
      status: 'Resume Received'
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
