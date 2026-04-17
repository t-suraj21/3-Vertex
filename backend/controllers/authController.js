const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT
const generateToken = (id, role) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'talentsync_super_secret_key';
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register Student
// @route   POST /api/auth/register/student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name, email, password: hashedPassword, role: 'student'
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Register Company & Verify via Gov API Simulation
// @route   POST /api/auth/register/company
exports.registerCompany = async (req, res) => {
  try {
    const { companyName, govRegId, gstCin, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Company email already registered' });
    }

    // --- MOCK GOVERNMENT VERIFICATION API ---
    // In a real scenario, this would be an axios call to MCA/GST portals.
    console.log(`[Validation] Running Gov Check against GST/CIN: ${gstCin}`);
    let verifiedStatus = 'pending';
    if (gstCin && gstCin.length > 5 && govRegId) {
      verifiedStatus = 'verified'; // Simulating successful Gov Database match
      console.log(`[Validation] MATCH FOUND. Company is legally registered.`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const company = await User.create({
      companyName, govRegId, gstCin, email, password: hashedPassword, role: 'company', verifiedStatus
    });

    // Simulated Action: "Send automatic email"
    if (verifiedStatus === 'verified') {
      console.log(`[Email Service] Sent to ${email}: Your company is verified and eligible to post jobs.`);
    }

    const token = generateToken(company._id, company.role);
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: company._id, companyName: company.companyName, role: company.role, verifiedStatus: company.verifiedStatus } 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Login User (Handles Student, Company, Admin)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    const payload = { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      location: user.location,
      github: user.github,
      linkedin: user.linkedin,
      portfolio: user.portfolio
    };
    
    if (user.role === 'company') {
      payload.companyName = user.companyName;
      payload.verifiedStatus = user.verifiedStatus;
    }

    res.status(200).json({ success: true, token, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, github, linkedin, portfolio, resume } = req.body;
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (github) user.github = github;
    if (linkedin) user.linkedin = linkedin;
    if (portfolio) user.portfolio = portfolio;
    if (resume) user.resume = resume;

    await user.save();
    
    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        resume: user.resume
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error updating profile' });
  }
};

// @desc    Update Profile Avatar
// @route   PUT /api/auth/profile/avatar
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error uploading avatar' });
  }
};

// @desc    Update Resume Document
// @route   PUT /api/auth/profile/resume
exports.updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file provided' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.resume = `/uploads/resumes/${req.file.filename}`;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error uploading resume' });
  }
};
