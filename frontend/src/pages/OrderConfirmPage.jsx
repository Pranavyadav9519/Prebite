import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, QrCode } from 'lucide-react';
import { orderApi } from '../api/orderApi';

const OrderConfirmPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderApi.getById(id);
      setOrder(response.data.data.order);
    } catch (err) {
      console.error('Error fetching order:', err);
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Link to="/menu" className="btn-primary">Go to Menu</Link>
        </div>
      </div>
    );
  }

  const pickupDate = new Date(order.pickupTime);
  const formattedTime = pickupDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h1>
          <p className="text-gray-500 mt-2">Your order has been confirmed</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-xl font-mono font-bold text-primary-500">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* QR Code */}
          {order.qrCode && (
            <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
              <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-500">Show this QR code at pickup</p>
              <img 
                src={order.qrCode} 
                alt="Order QR Code" 
                className="w-32 h-32 mx-auto mt-2 border rounded-lg"
              />
            </div>
          )}

          {/* Pickup Time */}
          <div className="flex items-center justify-center p-4 bg-primary-50 rounded-lg mb-6">
            <Clock className="w-6 h-6 text-primary-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Pickup Time</p>
              <p className="text-lg font-semibold text-primary-500">{formattedTime}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.menuItem.name} × {item.quantity}
                  </span>
                  <span>₹{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary-500">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link to={`/orders/${order.id}/track`} className="btn-primary text-center">
            Track Order
          </Link>
          <Link to="/menu" className="btn-secondary text-center">
            Order More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmPage;

