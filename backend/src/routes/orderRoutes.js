const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student routes
router.post('/', authMiddleware, orderController.createOrder);
router.post('/checkout', authMiddleware, orderController.checkoutOrder);
router.post('/verify', authMiddleware, orderController.verifyPayment);
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

// Admin routes
router.get('/', authMiddleware, roleMiddleware('admin'), orderController.getAllOrders);
router.post('/verify-token', authMiddleware, roleMiddleware('admin'), orderController.verifyToken);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), orderController.updateOrderStatus);
router.post('/verify-qr', authMiddleware, roleMiddleware('admin'), orderController.verifyQRCode);
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;

