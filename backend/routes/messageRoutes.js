const express = require('express');
const { getMessages, sendMessage, getInbox } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/inbox', protect, getInbox);
router.get('/:applicationId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
