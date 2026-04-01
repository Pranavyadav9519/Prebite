const prisma = require('../config/db');
const apiResponse = require('../utils/apiResponse');
const generateQR = require('../utils/generateQR');


const createOrder = async (req, res, next) => {
  try {
    const { items, pickupTime, notes, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiResponse.badRequest(res, 'Please provide order items');
    }

    if (!pickupTime) {
      return apiResponse.badRequest(res, 'Please select pickup time');
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem) {
        return apiResponse.badRequest(res, `Menu item not found: ${item.menuItemId}`);
      }

      if (!menuItem.isAvailable) {
        return apiResponse.badRequest(res, `${menuItem.name} is not available`);
      }

      const unitPrice = parseFloat(menuItem.price);
      const quantity = parseInt(item.quantity);
      totalAmount += unitPrice * quantity;

      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity,
        unitPrice,
        itemNotes: item.notes || null
      });
    }

    // Generate QR code data
    const qrData = {
      orderId: '', // Will be generated
      userId,
      pickupTime
    };

    // Create order with transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          pickupTime: new Date(pickupTime),
          notes: notes || null,
          status: 'placed',
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Update QR data with actual order ID
      qrData.orderId = newOrder.id;
      
      // Generate QR code
      const qrCode = await generateQR(qrData);

      // Update order with QR code
      const updatedOrder = await prisma.order.update({
        where: { id: newOrder.id },
        data: { qrCode },
        include: {
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
          }
        }
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          orderId: newOrder.id,
          amount: totalAmount,
          method: paymentMethod || 'cash',
          status: 'pending'
        }
      });

      return updatedOrder;
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('order:new', order);
    }

    return apiResponse.created(res, { order }, 'Order placed successfully');
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
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
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
      }
    });

    if (!order) {
      return apiResponse.notFound(res, 'Order not found');
    }

    // Check if user owns the order or is admin
    if (order.userId !== userId && userRole !== 'admin') {
      return apiResponse.forbidden(res, 'Access denied');
    }

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
          }
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
    const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up'];
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
      include: {
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
        }
      }
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      // Notify admin dashboard
      io.to('admin').emit('order:updated', updatedOrder);
      
      // Notify specific user
      io.to(`order:${id}`).emit('order:status', {
        orderId: id,
        status
      });
    }

    return apiResponse.ok(res, { order: updatedOrder }, 'Order status updated');
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

    const { orderId } = orderData;

    if (!orderId) {
      return apiResponse.badRequest(res, 'Invalid QR code data');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
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
        }
      }
    });

    if (!order) {
      return apiResponse.notFound(res, 'Order not found');
    }

    // Check if already picked up
    if (order.status === 'picked_up') {
      return apiResponse.badRequest(res, 'Order already picked up');
    }

    // Update status to picked_up
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'picked_up' },
      include: {
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
        }
      }
    });

    // Update payment status if exists
    await prisma.payment.update({
      where: { orderId: orderId },
      data: { status: 'completed', paidAt: new Date() }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('order:updated', updatedOrder);
      io.to(`order:${orderId}`).emit('order:status', {
        orderId,
        status: 'picked_up'
      });
    }

    return apiResponse.ok(res, { order: updatedOrder }, 'Order verified and picked up');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  verifyQRCode
};

