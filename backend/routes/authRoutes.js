const express = require('express');
const { registerStudent, registerCompany, login, updateProfile, updateAvatar, updateResume } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register/student', registerStudent);
router.post('/register/company', registerCompany);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), updateAvatar);
router.put('/profile/resume', protect, upload.single('resume'), updateResume);

module.exports = router;
