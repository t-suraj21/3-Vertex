const User = require('../models/User');

// @desc    Toggle Save Job
// @route   POST /api/jobs/save/:id
exports.toggleSaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.id;

    const index = user.savedJobs.indexOf(jobId);
    if (index === -1) {
      user.savedJobs.push(jobId);
    } else {
      user.savedJobs.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ success: true, savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error saving job' });
  }
};
