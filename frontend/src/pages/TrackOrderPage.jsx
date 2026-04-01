import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { orderApi } from '../api/orderApi';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import OrderTimeline from '../components/order/OrderTimeline';

const TrackOrderPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderApi.getById(id);
      setOrder(response.data.data.order);
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Order not found'}</p>
          <Link to="/menu" className="btn-primary">Go to Menu</Link>
        </div>
      </div>
    );
  }

  const pickupDate = new Date(order.pickupTime);
  const formattedDate = pickupDate.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = pickupDate.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Track Your Order</h1>
          <p className="text-gray-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Timeline */}
          <OrderTimeline currentStatus={order.status} />
        </div>

        {/* Pickup Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Pickup Information</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-primary-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Pickup Time</p>
                <p className="font-semibold">{formattedTime}</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.orderItems?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  {item.itemNotes && (
                    <p className="text-xs text-gray-400">Note: {item.itemNotes}</p>
                  )}
                </div>
                <p className="font-semibold">₹{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary-500">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* QR Code */}
        {order.qrCode && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="font-semibold text-lg mb-4">Pickup QR Code</h2>
            <img 
              src={order.qrCode} 
              alt="Order QR Code" 
              className="w-48 h-48 mx-auto border rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-2">Show this code at pickup counter</p>
          </div>
        )}

        {/* Back to Menu */}
        <div className="mt-6 text-center">
          <Link to="/menu" className="btn-secondary">
            Order More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;

