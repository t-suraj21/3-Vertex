const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendSystemMessage } = require('./messageController');

// @desc    Apply for a Job
// @route   POST /api/applications/apply/:jobId
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;

    // Check if already applied
    const existing = await Application.findOne({ studentId, jobId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Already applied for this job' });
    }

    const application = await Application.create({
      studentId,
      jobId,
      status: 'Resume Received'
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error applying to job' });
  }
};

// @desc    Get Student Application Tracking
// @route   GET /api/applications/tracker
exports.getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId', 'title location type salary companyId')
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'companyName avatar' }
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error fetching applications' });
  }
};

// @desc    Update Application Status (Company Side)
// @route   PUT /api/applications/status/:id
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    
    // Only send automated message if status actually changed
    if (application.status !== status) {
      application.status = status;
      await application.save();

      // Trigger realtime automated system message to the student
      await sendSystemMessage(
        application._id, 
        `Your application status has been updated to: ${status}`
      );
    }

    res.status(200).json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error updating status' });
  }
};

// @desc    Get Applications for Company Jobs
// @route   GET /api/applications/company
exports.getCompanyApplications = async (req, res) => {
  try {
    // Find all jobs created by this company
    const jobs = await Job.find({ companyId: req.user.id }).select('_id title');
    const jobIds = jobs.map(j => j._id);

    // Find all applications for these jobs, populate full student details
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('studentId', 'name avatar resume github linkedin portfolio skills phone location')
      .populate('jobId', 'title skillsRequired')
      .sort('-createdAt');

    // Mark all unviewed applications as viewed (so student sees "Company viewed")
    await Application.updateMany(
      { jobId: { $in: jobIds }, viewedByCompany: false },
      { $set: { viewedByCompany: true } }
    );

    res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error fetching company applications' });
  }
};
