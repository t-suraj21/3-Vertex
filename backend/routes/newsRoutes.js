const express = require('express');
const { getITNews } = require('../controllers/newsController');

const router = express.Router();

router.get('/', getITNews);

module.exports = router;
