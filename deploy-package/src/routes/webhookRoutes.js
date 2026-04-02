const express = require('express');
const { openrouterWebhook } = require('../controllers/webhookController');

const router = express.Router();

// OpenRouter webhook endpoint (for async events/callbacks)
router.post('/webhook', openrouterWebhook);

module.exports = router;
