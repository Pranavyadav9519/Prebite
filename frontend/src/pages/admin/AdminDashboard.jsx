import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, Clock, TrendingUp, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import { analyticsApi } from '../../api/analyticsApi';
import { orderApi } from '../../api/orderApi';
import { useAuthStore } from '../../store/authStore';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const setupSocket = () => {
    const newSocket = io('http://localhost:4000', {
      auth: {
        token: accessToken
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join:admin');
    });

    newSocket.on('order:new', (order) => {
      console.log('New order received:', order);
      setRecentOrders(prev => [order, ...prev.slice(0, 9)]);
      setNotifications(prev => [{
        id: Date.now(),
        message: `New order from ${order.user.name}`,
        orderId: order.id,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingOrders: prev.pendingOrders + 1,
        todayOrders: prev.todayOrders + 1
      }));
    });

    newSocket.on('order:updated', (order) => {
      setRecentOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    setSocket(newSocket);
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await orderApi.getAllOrders({ limit: 10, sort: '-createdAt' });
      setRecentOrders(response.data.data.orders);
    } catch (err) {
      console.error('Error fetching recent orders:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await analyticsApi.getDashboard();
      const data = response.data.data;
      setStats({
        todayOrders: data.todayOrderCount,
        todayRevenue: data.todayRevenue,
        pendingOrders: data.pendingOrders,
        totalItems: data.menuItemsCount
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/orders'
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      link: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-orange-500',
      link: '/admin/orders'
    },
    {
      title: 'Menu Items',
      value: stats.totalItems,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/admin/menu'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>New Order Alert:</strong> {notifications[0].message}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                {notifications[0].timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{order.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">₹{order.totalAmount.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'placed' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link
              to="/admin/orders"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <p className="font-medium text-blue-700">View All Orders</p>
              <p className="text-sm text-blue-500">Manage incoming orders</p>
            </Link>
            <Link
              to="/admin/menu"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <p className="font-medium text-green-700">Manage Menu</p>
              <p className="text-sm text-green-500">Add, edit or remove items</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Database</span>
            <span className="text-green-500 font-medium">Connected</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">API Status</span>
            <span className="text-green-500 font-medium">Online</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Version</span>
            <span className="text-gray-500">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;