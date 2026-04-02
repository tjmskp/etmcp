const express = require('express');
const { setup } = require('../controllers/setupController');

const router = express.Router();
router.post('/', setup);

module.exports = router;
