const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All analytics routes require admin authentication
router.get('/dashboard', authMiddleware, roleMiddleware('admin'), analyticsController.getDashboardSummary);
router.get('/daily', authMiddleware, roleMiddleware('admin'), analyticsController.getDailyAnalytics);
router.get('/weekly', authMiddleware, roleMiddleware('admin'), analyticsController.getWeeklyAnalytics);

module.exports = router;

