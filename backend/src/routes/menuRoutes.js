const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.get('/', menuController.getMenuItems);
router.get('/categories', menuController.getCategories);
router.get('/:id', menuController.getMenuItemById);

// Admin routes
router.post('/', authMiddleware, roleMiddleware('admin'), menuController.createMenuItem);
router.put('/:id', authMiddleware, roleMiddleware('admin'), menuController.updateMenuItem);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), menuController.deleteMenuItem);

// Seed menu items (for development)
router.post('/seed', authMiddleware, roleMiddleware('admin'), menuController.seedMenuItems);

module.exports = router;

