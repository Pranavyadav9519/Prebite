import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderApi } from '../api/orderApi';
import CartItem from '../components/cart/CartItem';

const loadRazorpayCheckout = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CartPage = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate time slots starting 15 min from now
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const earliest = new Date(now.getTime() + 15 * 60 * 1000);
    let startHour = earliest.getHours();
    let startMinute = Math.ceil(earliest.getMinutes() / 10) * 10;
    if (startMinute >= 60) { startHour += 1; startMinute = 0; }

    for (let hour = startHour; hour < 24; hour++) {
      const minStart = hour === startHour ? startMinute : 0;
      for (let min = minStart; min < 60; min += 10) {
        slots.push(
          `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        );
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!pickupTime) {
      setError('Please select a pickup time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build pickup ISO time using local date to avoid UTC timezone mismatch
      let pickupISOTime;
      if (pickupTime === 'ASAP') {
        pickupISOTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      } else {
        const now = new Date();
        const [hours, minutes] = pickupTime.split(':').map(Number);
        const localPickup = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0
        );
        pickupISOTime = localPickup.toISOString();
      }

      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        })),
        pickupTime: pickupISOTime,
        notes
      };

      const scriptLoaded = await loadRazorpayCheckout();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout. Check your connection and try again.');
      }

      const response = await orderApi.checkout(orderData);
      const { order, razorpayOrder, razorpayKeyId } = response.data.data;

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Prebite',
        description: `Order ${order.id.slice(0, 8).toUpperCase()}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#ed700e'
        },
        modal: {
          ondismiss: () => {
            // User closed the modal without paying
            setLoading(false);
          }
        },
        handler: async (paymentResponse) => {
          try {
            const verification = await orderApi.verifyPayment({
              orderId: order.id,
              ...paymentResponse
            });
            clearCart();
            navigate(`/orders/${verification.data.data.order.id}/confirm`);
          } catch (verificationError) {
            console.error('Payment verification error:', verificationError);
            setError(verificationError.response?.data?.message || 'Payment was captured but verification failed. Contact support.');
            setLoading(false);
          }
        }
      });

      // Don't reset loading here — the modal is open; handler/ondismiss will reset it
      razorpay.open();
    } catch (err) {
      console.error('Order error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!pickupTime) {
      setError('Please select a pickup time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let pickupISOTime;
      if (pickupTime === 'ASAP') {
        pickupISOTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      } else {
        const now = new Date();
        const [hours, minutes] = pickupTime.split(':').map(Number);
        const localPickup = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0
        );
        pickupISOTime = localPickup.toISOString();
      }

      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        })),
        pickupTime: pickupISOTime,
        notes,
        paymentMethod: 'demo'
      };

      const response = await orderApi.create(orderData);
      clearCart();
      navigate(`/orders/${response.data.data.order.id}/confirm`);
    } catch (err) {
      console.error('Demo order error:', err);
      setError(err.response?.data?.message || 'Failed to place demo order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
          <Link to="/menu" className="btn-primary">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <CartItem key={item.menuItem.id} item={item} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Pickup Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Select Pickup Time
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose a time...</option>
                  <option value="ASAP">ASAP (~15 min)</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                  <span>₹{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary-500">₹{getTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Buttons */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !pickupTime}
                className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting Payment...' : 'Pay with Razorpay'}
              </button>
              <button
                onClick={handleDemoOrder}
                disabled={loading || !pickupTime}
                className="w-full btn-secondary mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Demo Order...' : 'Demo Pay (Skip Gateway)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

