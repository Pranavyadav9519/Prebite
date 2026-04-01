const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student routes
router.post('/', authMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);

// Admin routes
router.get('/', authMiddleware, roleMiddleware('admin'), orderController.getAllOrders);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), orderController.updateOrderStatus);
router.post('/verify-qr', authMiddleware, roleMiddleware('admin'), orderController.verifyQRCode);

module.exports = router;

