const express = require('express');
const adminController = require('../controllers/adminController');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(auth, requireAdmin);

router.get('/logs', adminController.getLogs);
router.get('/leads', adminController.getLeads);
router.get('/service-mapping', adminController.getServiceMapping);
router.post('/service-mapping', adminController.createServiceMapping);
router.put('/service-mapping/:id', adminController.updateServiceMapping);
router.delete('/service-mapping/:id', adminController.deleteServiceMapping);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.putSetting);

router.get('/status', adminController.getStatus);

router.get('/training-data', adminController.listTrainingData);
router.post('/training-data', adminController.createTrainingData);
router.put('/training-data/:id', adminController.updateTrainingData);
router.delete('/training-data/:id', adminController.deleteTrainingData);

router.post('/train', adminController.runTraining);
router.post('/integration/send', adminController.sendIntegration);

module.exports = router;
