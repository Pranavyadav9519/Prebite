import { useState, useEffect } from 'react';
import { RefreshCw, Check, ChefHat, Package, CheckCircle } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAll({ status: filter !== 'all' ? filter : undefined });
      setOrders(response.data.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      placed: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'picked_up'
    };
    return statusFlow[currentStatus];
  };

  const getStatusButton = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return null;

    const buttons = {
      confirmed: { label: 'Start Preparing', icon: ChefHat, color: 'bg-orange-500' },
      preparing: { label: 'Mark Ready', icon: Package, color: 'bg-green-500' },
      ready: { label: 'Picked Up', icon: CheckCircle, color: 'bg-gray-500' }
    };

    return buttons[nextStatus];
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const statusCounts = {
    all: orders.length,
    placed: orders.filter(o => o.status === 'placed').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <button
          onClick={fetchOrders}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'placed', 'confirmed', 'preparing', 'ready'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-sm">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusButton = getStatusButton(order.status);
            const pickupTime = new Date(order.pickupTime);
            const isOverdue = pickupTime < new Date() && order.status !== 'picked_up';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-md p-6 ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono font-bold text-lg">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <OrderStatusBadge status={order.status} />
                      {isOverdue && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium">{order.user?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pickup Time</p>
                        <p className="font-medium">
                          {pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Items</p>
                        <p className="font-medium">
                          {order.orderItems?.reduce((acc, item) => acc + item.quantity, 0)} items
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-semibold text-primary-500">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {order.orderItems?.map((item) => (
                          <span key={item.id} className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                            {item.menuItem.name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="mt-2 text-sm text-gray-500">
                          Note: {order.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {order.status === 'placed' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        className="btn-primary flex items-center justify-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm</span>
                      </button>
                    )}
                    {statusButton && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                        className={`${statusButton.color} text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:opacity-90`}
                      >
                        <statusButton.icon className="w-4 h-4" />
                        <span>{statusButton.label}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;

