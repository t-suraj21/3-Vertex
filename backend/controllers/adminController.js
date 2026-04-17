const User = require('../models/User');
const Report = require('../models/Report');
const Job = require('../models/Job');

// @desc    Get Pending Company Verifications
// @route   GET /api/admin/verifications
exports.getPendingVerifications = async (req, res) => {
  try {
    const pendingCompanies = await User.find({ role: 'company', verifiedStatus: 'pending' }).select('-password');
    res.status(200).json({ success: true, count: pendingCompanies.length, data: pendingCompanies });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update Company Verification Status
// @route   PUT /api/admin/verifications/:id
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    const company = await User.findById(req.params.id);
    
    if (!company || company.role !== 'company') {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    company.verifiedStatus = status;
    await company.save();

    res.status(200).json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get Fraud Reports
// @route   GET /api/admin/reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporterId', 'email role').populate('reportedEntityId', 'email role companyName name');
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Dashboard Analytics Metrics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ role: 'student' });
    const companiesCount = await User.countDocuments({ role: 'company' });
    const activeJobsCount = await Job.countDocuments({ isActive: true });
    const pendingVerifications = await User.countDocuments({ role: 'company', verifiedStatus: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalStudents: studentsCount,
        totalCompanies: companiesCount,
        activeJobs: activeJobsCount,
        actionRequired: pendingVerifications
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
