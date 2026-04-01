const prisma = require('../config/db');
const apiResponse = require('../utils/apiResponse');

// Get daily analytics
const getDailyAnalytics = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Start of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // End of day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get orders for the day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
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

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    
    // Status counts
    const statusCounts = {
      PENDING_PAYMENT: 0,
      PAID: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    orders.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });

    // Most ordered items
    const itemCounts = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId].count += item.quantity;
          itemCounts[item.menuItemId].revenue += parseFloat(item.unitPrice) * item.quantity;
        } else {
          itemCounts[item.menuItemId] = {
            menuItemId: item.menuItemId,
            name: item.menuItem.name,
            count: item.quantity,
            revenue: parseFloat(item.unitPrice) * item.quantity
          };
        }
      });
    });

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hourly distribution
    const hourlyDistribution = Array(12).fill(0); // 8 AM to 8 PM
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      if (hour >= 8 && hour <= 19) {
        hourlyDistribution[hour - 8]++;
      }
    });

    return apiResponse.ok(res, {
      date: targetDate.toISOString().split('T')[0],
      totalOrders,
      totalRevenue,
      statusCounts,
      topItems,
      hourlyDistribution: hourlyDistribution.map((count, index) => ({
        hour: `${index + 8}:00`,
        count
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Get weekly analytics
const getWeeklyAnalytics = async (req, res, next) => {
  try {
    const { weeks = 1 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (parseInt(weeks) * 7));
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        status: true
      }
    });

    // Daily breakdown
    const dailyData = {};
    for (let i = 0; i < parseInt(weeks) * 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { orders: 0, revenue: 0 };
    }

    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].orders++;
        dailyData[dateStr].revenue += parseFloat(order.totalAmount);
      }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return apiResponse.ok(res, {
      startDate: startDate.toISOString(),
      dailyData: Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data
      })),
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue: averageOrderValue.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard summary (quick stats for admin)
const getDashboardSummary = async (req, res, next) => {
  try {
    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const todayOrderCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    // Pending orders (not picked up)
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    });

    // Total users
    const totalUsers = await prisma.user.count({
      where: {
        role: 'student'
      }
    });

    // Menu items count
    const menuItemsCount = await prisma.menuItem.count({
      where: {
        isAvailable: true
      }
    });

    return apiResponse.ok(res, {
      todayOrderCount,
      todayRevenue,
      pendingOrders,
      totalUsers,
      menuItemsCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getDashboardSummary
};

