const crypto = require('crypto');
const prisma = require('../config/db');
const apiResponse = require('../utils/apiResponse');
const generateQR = require('../utils/generateQR');
const { getCredentials, getRazorpayClient, verifyRazorpaySignature } = require('../utils/razorpay');

const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const TERMINAL_STATUSES = [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED];
const TOKEN_VERIFIABLE_STATUSES = [ORDER_STATUS.PAID, ORDER_STATUS.PREPARING, ORDER_STATUS.READY];

const fullOrderInclude = {
  orderItems: {
    include: {
      menuItem: true
    }
  },
  user: {
    select: {
      name: true,
      email: true
    }
  },
  payment: true
};

const createTokenCode = async (transactionClient) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const bytes = crypto.randomBytes(6);
    let tokenCode = '';

    for (let index = 0; index < 6; index += 1) {
      tokenCode += alphabet[bytes[index] % alphabet.length];
    }

    const existingOrder = await transactionClient.order.findUnique({
      where: { tokenCode }
    });

    if (!existingOrder) {
      return tokenCode;
    }
  }

  const error = new Error('Unable to generate a unique pickup token. Please try again.');
  error.statusCode = 500;
  throw error;
};

const buildQrCode = async ({ orderId, tokenCode, userId, pickupTime }) => {
  return generateQR({
    orderId,
    tokenCode,
    userId,
    pickupTime
  });
};

const validateAndPriceOrderItems = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Please provide order items');
    error.statusCode = 400;
    throw error;
  }

  let totalAmount = 0;
  const orderItemsData = [];

  for (const item of items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId }
    });

    if (!menuItem) {
      const error = new Error(`Menu item not found: ${item.menuItemId}`);
      error.statusCode = 400;
      throw error;
    }

    if (!menuItem.isAvailable) {
      const error = new Error(`${menuItem.name} is not available`);
      error.statusCode = 400;
      throw error;
    }

    const quantity = parseInt(item.quantity, 10);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error(`Invalid quantity for ${menuItem.name}`);
      error.statusCode = 400;
      throw error;
    }

    const unitPrice = parseFloat(menuItem.price);
    totalAmount += unitPrice * quantity;

    orderItemsData.push({
      menuItemId: item.menuItemId,
      quantity,
      unitPrice,
      itemNotes: item.notes || null
    });
  }

  return { orderItemsData, totalAmount };
};

const normalizePickupTime = (pickupTime) => {
  if (!pickupTime) {
    const error = new Error('Please select pickup time');
    error.statusCode = 400;
    throw error;
  }

  const parsedPickupTime = new Date(pickupTime);
  if (Number.isNaN(parsedPickupTime.getTime())) {
    const error = new Error('Invalid pickup time');
    error.statusCode = 400;
    throw error;
  }

  return parsedPickupTime;
};

const loadOrderForUser = async ({ orderId, userId, userRole }) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: fullOrderInclude
  });

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.userId !== userId && userRole !== 'admin') {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  return order;
};

const emitOrderEvent = (req, eventName, payload) => {
  const io = req.app.get('io');
  if (!io) {
    return;
  }

  io.to('admin').emit(eventName, payload);
  io.to(`order:${payload.id}`).emit('order:status', {
    orderId: payload.id,
    status: payload.status,
    tokenCode: payload.tokenCode || null
  });
};

const createOrder = async (req, res, next) => {
  try {
    const { items, pickupTime, notes, paymentMethod = 'cash' } = req.body;
    const userId = req.user.id;
    const normalizedPickupTime = normalizePickupTime(pickupTime);
    const { orderItemsData, totalAmount } = await validateAndPriceOrderItems(items);

    const order = await prisma.$transaction(async (transactionClient) => {
      const tokenCode = await createTokenCode(transactionClient);

      const createdOrder = await transactionClient.order.create({
        data: {
          userId,
          totalAmount,
          pickupTime: normalizedPickupTime,
          notes: notes || null,
          status: ORDER_STATUS.PAID,
          paymentProvider: paymentMethod,
          tokenCode,
          orderItems: {
            create: orderItemsData
          },
          payment: {
            create: {
              amount: totalAmount,
              method: paymentMethod,
              status: 'completed',
              paidAt: new Date()
            }
          }
        },
        include: fullOrderInclude
      });

      const qrCode = await buildQrCode({
        orderId: createdOrder.id,
        tokenCode,
        userId,
        pickupTime: normalizedPickupTime.toISOString()
      });

      return transactionClient.order.update({
        where: { id: createdOrder.id },
        data: { qrCode },
        include: fullOrderInclude
      });
    });

    emitOrderEvent(req, 'order:new', order);
    return apiResponse.created(res, { order }, 'Cash order placed successfully');
  } catch (error) {
    next(error);
  }
};

const checkoutOrder = async (req, res, next) => {
  try {
    const { items, pickupTime, notes } = req.body;
    const userId = req.user.id;
    const normalizedPickupTime = normalizePickupTime(pickupTime);
    const { orderItemsData, totalAmount } = await validateAndPriceOrderItems(items);
    const razorpay = getRazorpayClient();
    const { keyId } = getCredentials();

    const createdOrder = await prisma.$transaction(async (transactionClient) => {
      const localOrder = await transactionClient.order.create({
        data: {
          userId,
          totalAmount,
          pickupTime: normalizedPickupTime,
          notes: notes || null,
          status: ORDER_STATUS.PENDING_PAYMENT,
          paymentProvider: 'razorpay',
          orderItems: {
            create: orderItemsData
          },
          payment: {
            create: {
              amount: totalAmount,
              method: 'razorpay',
              status: 'created'
            }
          }
        }
      });

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: localOrder.id,
        notes: {
          orderId: localOrder.id,
          userId
        }
      });

      return transactionClient.order.update({
        where: { id: localOrder.id },
        data: {
          providerOrderId: razorpayOrder.id,
          payment: {
            update: {
              providerOrderId: razorpayOrder.id,
              status: 'pending'
            }
          }
        },
        include: fullOrderInclude
      });
    });

    return apiResponse.created(res, {
      order: createdOrder,
      razorpayOrder: {
        id: createdOrder.providerOrderId,
        amount: Math.round(createdOrder.totalAmount * 100),
        currency: 'INR'
      },
      razorpayKeyId: keyId
    }, 'Checkout created successfully');
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id: providerOrderId, razorpay_payment_id: providerPaymentId, razorpay_signature: providerSignature } = req.body;

    if (!orderId || !providerOrderId || !providerPaymentId || !providerSignature) {
      return apiResponse.badRequest(res, 'Missing Razorpay verification fields');
    }

    if (!verifyRazorpaySignature({ orderId: providerOrderId, paymentId: providerPaymentId, signature: providerSignature })) {
      return apiResponse.unauthorized(res, 'Invalid Razorpay signature');
    }

    const existingOrder = await loadOrderForUser({
      orderId,
      userId: req.user.id,
      userRole: req.user.role
    });

    if (existingOrder.status !== ORDER_STATUS.PENDING_PAYMENT) {
      return apiResponse.ok(res, { order: existingOrder }, 'Order already verified');
    }

    if (existingOrder.providerOrderId !== providerOrderId) {
      return apiResponse.badRequest(res, 'Razorpay order does not match the local order');
    }

    const order = await prisma.$transaction(async (transactionClient) => {
      const tokenCode = await createTokenCode(transactionClient);
      const qrCode = await buildQrCode({
        orderId,
        tokenCode,
        userId: req.user.id,
        pickupTime: existingOrder.pickupTime.toISOString()
      });

      return transactionClient.order.update({
        where: { id: orderId },
        data: {
          status: ORDER_STATUS.PAID,
          tokenCode,
          qrCode,
          providerPaymentId,
          payment: {
            update: {
              status: 'completed',
              paidAt: new Date(),
              providerPaymentId,
              providerSignature
            }
          }
        },
        include: fullOrderInclude
      });
    });

    emitOrderEvent(req, 'order:new', order);
    return apiResponse.ok(res, { order }, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
};

// Get user's orders
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: fullOrderInclude,
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse.ok(res, { orders });
  } catch (error) {
    next(error);
  }
};

// Get single order
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await loadOrderForUser({ orderId: id, userId, userRole });

    return apiResponse.ok(res, { order });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    const where = {};

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filter by date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          ...fullOrderInclude
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    return apiResponse.ok(res, { 
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      ORDER_STATUS.PENDING_PAYMENT,
      ORDER_STATUS.PAID,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.CANCELLED
    ];
    if (!validStatuses.includes(status)) {
      return apiResponse.badRequest(res, 'Invalid status');
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return apiResponse.notFound(res, 'Order not found');
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: fullOrderInclude
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      // Notify admin dashboard
      io.to('admin').emit('order:updated', updatedOrder);
      
      // Notify specific user
      io.to(`order:${id}`).emit('order:status', {
        orderId: id,
        status,
        tokenCode: updatedOrder.tokenCode || null
      });
    }

    return apiResponse.ok(res, { order: updatedOrder }, 'Order status updated');
  } catch (error) {
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const { tokenCode, status } = req.body;

    if (!tokenCode) {
      return apiResponse.badRequest(res, 'Pickup token is required');
    }

    const order = await prisma.order.findFirst({
      where: {
        tokenCode: tokenCode.toUpperCase()
      },
      include: fullOrderInclude
    });

    if (!order) {
      return apiResponse.notFound(res, 'Order not found for this pickup token');
    }

    if (!TOKEN_VERIFIABLE_STATUSES.includes(order.status)) {
      return apiResponse.badRequest(res, 'Order is not available for pickup token verification');
    }

    const nextStatus = status || (order.status === ORDER_STATUS.READY ? ORDER_STATUS.COMPLETED : ORDER_STATUS.READY);
    if (![ORDER_STATUS.READY, ORDER_STATUS.COMPLETED].includes(nextStatus)) {
      return apiResponse.badRequest(res, 'Invalid pickup verification status');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
      include: fullOrderInclude
    });

    emitOrderEvent(req, 'order:updated', updatedOrder);
    return apiResponse.ok(res, { order: updatedOrder }, 'Pickup token verified successfully');
  } catch (error) {
    next(error);
  }
};

// Verify QR code (admin only)
const verifyQRCode = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    let orderData;
    try {
      orderData = JSON.parse(qrData);
    } catch {
      return apiResponse.badRequest(res, 'Invalid QR code format');
    }

    const { orderId, tokenCode } = orderData;

    if (!orderId && !tokenCode) {
      return apiResponse.badRequest(res, 'Invalid QR code data');
    }

    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { tokenCode },
      include: fullOrderInclude
    });

    if (!order) {
      return apiResponse.notFound(res, 'Order not found');
    }

    if (!TOKEN_VERIFIABLE_STATUSES.includes(order.status)) {
      return apiResponse.badRequest(res, 'Order is not available for QR verification');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: ORDER_STATUS.COMPLETED },
      include: fullOrderInclude
    });

    emitOrderEvent(req, 'order:updated', updatedOrder);

    return apiResponse.ok(res, { order: updatedOrder }, 'Order verified and completed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  checkoutOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  verifyToken,
  verifyQRCode
};

