const express = require('express');
const { processMessage } = require('../controllers/mcpController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.post('/process', auth, processMessage);

module.exports = router;
