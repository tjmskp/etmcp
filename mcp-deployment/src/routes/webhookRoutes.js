const express = require('express');
const { openrouterWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/webhook', openrouterWebhook);

module.exports = router;
