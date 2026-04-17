const Message = require('../models/Message');
const Application = require('../models/Application');

// @desc    Get inbox headers (list of open conversations)
// @route   GET /api/messages/inbox
exports.getInbox = async (req, res) => {
  try {
    const isCompany = req.user.role === 'company';
    let applicationIds = [];
    
    if (isCompany) {
      // Find all applications for jobs posted by this company
      const Job = require('../models/Job');
      const jobs = await Job.find({ companyId: req.user.id });
      const jobIds = jobs.map(j => j._id);
      
      const apps = await Application.find({ jobId: { $in: jobIds } })
        .populate('studentId', 'name avatar')
        .populate('jobId', 'title');
      
      return res.status(200).json({ success: true, inbox: apps });
    } else {
      // Find all applications where this student applied
      const apps = await Application.find({ studentId: req.user.id })
        .populate({
          path: 'jobId',
          populate: { path: 'companyId', select: 'companyName avatar' }
        });
      
      return res.status(200).json({ success: true, inbox: apps });
    }
  } catch (err) {
    console.error("Inbox Error:", err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get messages for a specific conversation (Application ID)
// @route   GET /api/messages/:applicationId
exports.getMessages = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application exists and user has access
    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('studentId', 'name avatar')
      .populate({
         path: 'jobId',
         populate: { path: 'companyId', select: 'companyName avatar' }
      });
      
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Access control: Only the student who applied, or the company that posted
    const isStudent = req.user.id === application.studentId._id.toString();
    const isCompany = req.user.id === application.jobId.companyId._id.toString();
    
    if (!isStudent && !isCompany) {
      return res.status(403).json({ success: false, error: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ conversationId: applicationId })
      .populate('senderUser', 'name companyName')
      .sort('createdAt'); // Chronological

    res.status(200).json({ 
      success: true, 
      messages,
      context: {
        jobTitle: application.jobId.title,
        studentName: application.studentId.name,
        companyName: application.jobId.companyId.companyName
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { applicationId, content } = req.body;

    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });

    const isStudent = req.user.id === application.studentId.toString();
    const isCompany = req.user.id === application.jobId.companyId.toString();

    if (!isStudent && !isCompany) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const message = await Message.create({
      conversationId: applicationId,
      senderUser: req.user.id,
      content
    });

    // Populate sender details for the real-time receiver
    const populatedMessage = await Message.findById(message._id).populate('senderUser', 'name companyName avatar');

    if (global.io) {
      global.io.to(applicationId.toString()).emit('new-message', populatedMessage);
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Helper: send system message (Internal use, not an API route)
exports.sendSystemMessage = async (applicationId, content) => {
  try {
    const message = await Message.create({
      conversationId: applicationId,
      senderUser: null,
      content,
      isSystemMessage: true
    });

    if (global.io) {
      global.io.to(applicationId.toString()).emit('new-message', message);
    }
  } catch(err) {
    console.error("System message failed:", err);
  }
}
