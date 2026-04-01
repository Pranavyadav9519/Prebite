import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, Smartphone } from 'lucide-react';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-orange-100 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Skip the Line,<br />
              <span className="text-primary-500">Grab the Bite!</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Pre-order your favorite meals from the canteen and skip the queue. 
              Simply order, pick up, and enjoy!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu" className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center">
                Order Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Browse & Order</h3>
              <p className="text-gray-600">
                Browse our menu, add your favorite items to cart, and place your order in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Select Pickup Time</h3>
              <p className="text-gray-600">
                Choose a convenient pickup time slot that works for you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Skip the Queue</h3>
              <p className="text-gray-600">
                Show up at the pickup time, grab your order with your unique QR code, and enjoy!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Prebite?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600 text-sm">No more waiting in long queues during your break time.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Easy Ordering</h3>
              <p className="text-gray-600 text-sm">Order from anywhere on campus with just a few taps.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">Track your order status in real-time as it's being prepared.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-semibold mb-2">Easy Payments</h3>
              <p className="text-gray-600 text-sm">Pay cash on pickup or pay online seamlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Skip the Queue?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join thousands of students who are already enjoying faster, easier canteen service.
          </p>
          <Link 
            to="/register" 
            className="bg-white text-primary-500 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg inline-block transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

