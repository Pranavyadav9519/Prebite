import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, Smartphone, ChevronDown, Star, Zap, ShieldCheck, Utensils } from 'lucide-react';

// ─── Section Nav Dots ───────────────────────────────────────────────────────
const SectionDots = ({ total, active, onDotClick }) => (
  <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
    {Array.from({ length: total }).map((_, i) => (
      <button
        key={i}
        onClick={() => onDotClick(i)}
        aria-label={`Go to section ${i + 1}`}
        className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
          i === active
            ? 'bg-orange-500 border-orange-500 scale-125'
            : 'bg-transparent border-orange-300 hover:border-orange-500'
        }`}
      />
    ))}
  </div>
);

// ─── Animated Section Wrapper ────────────────────────────────────────────────
const Section = ({ children, className = '', index, onVisible }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('section-visible');
          onVisible(index);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onVisible]);

  return (
    <section
      ref={ref}
      data-index={index}
      className={`snap-section section-animate ${className}`}
    >
      {children}
    </section>
  );
};

// ─── Floating Food Emoji ─────────────────────────────────────────────────────
const FloatingEmoji = ({ emoji, style }) => (
  <span className="floating-emoji select-none pointer-events-none absolute text-5xl opacity-20" style={style}>
    {emoji}
  </span>
);

// ─── Stats Counter ───────────────────────────────────────────────────────────
const StatCard = ({ value, label, icon }) => (
  <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-xs text-orange-200 font-medium">{label}</div>
  </div>
);

// ─── Feature Card ────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <div
    className="feature-card bg-white rounded-xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    style={{ animationDelay: delay }}
  >
    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-orange-500" />
    </div>
    <h3 className="font-bold text-gray-800 text-sm mb-1.5">{title}</h3>
    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
  </div>
);

// ─── Step Card ───────────────────────────────────────────────────────────────
const StepCard = ({ step, icon: Icon, title, desc, color }) => (
  <div className="flex flex-col items-center text-center step-card">
    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-7 h-7 text-white" />
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-orange-400 rounded-full text-[10px] font-black text-orange-500 flex items-center justify-center">
        {step}
      </span>
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-1.5">{title}</h3>
    <p className="text-gray-500 text-xs leading-relaxed max-w-xs">{desc}</p>
  </div>
);

// ─── Testimonial ─────────────────────────────────────────────────────────────
const Testimonial = ({ name, dept, quote, rating }) => (
  <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow flex flex-col gap-2">
    <div className="flex gap-1">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
      ))}
    </div>
    <p className="text-gray-600 text-xs italic leading-relaxed">"{quote}"</p>
    <div>
      <p className="font-semibold text-gray-800 text-xs">{name}</p>
      <p className="text-gray-400 text-[10px]">{dept}</p>
    </div>
  </div>
);

// ─── HomePage ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);
  const TOTAL_SECTIONS = 5;

  const scrollToSection = (index) => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll('.snap-section');
    sections[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVisible = (index) => setActiveSection(index);

  return (
    <div
      ref={containerRef}
      className="fullpage-container"
    >
      <SectionDots total={TOTAL_SECTIONS} active={activeSection} onDotClick={scrollToSection} />

      {/* ── Section 1: Hero ──────────────────────────────────────────────── */}
      <Section
        index={0}
        onVisible={handleVisible}
        className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden flex items-center justify-center"
      >
        {/* Floating food bg */}
        <FloatingEmoji emoji="🍱" style={{ top: '8%', left: '4%', animationDuration: '6s' }} />
        <FloatingEmoji emoji="🍔" style={{ top: '15%', right: '6%', animationDuration: '8s', animationDelay: '1s' }} />
        <FloatingEmoji emoji="🥗" style={{ bottom: '18%', left: '8%', animationDuration: '7s', animationDelay: '2s' }} />
        <FloatingEmoji emoji="🍜" style={{ bottom: '12%', right: '4%', animationDuration: '9s', animationDelay: '0.5s' }} />
        <FloatingEmoji emoji="🧃" style={{ top: '40%', left: '2%', animationDuration: '5s', animationDelay: '3s' }} />
        <FloatingEmoji emoji="🥙" style={{ top: '60%', right: '3%', animationDuration: '7.5s', animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-orange-200">
            <Utensils className="w-3.5 h-3.5" />
            Campus Canteen Pre-Order System
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-5 leading-tight tracking-tight">
            Skip the Line,<br />
            <span className="text-gradient">Grab the Bite!</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Pre-order your favourite canteen meals in seconds. Choose your pickup time, pay online, and walk straight to the counter — no waiting, no stress.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/menu"
              id="hero-order-now"
              className="group inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-6 py-3 rounded-xl shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-orange-300 hover:-translate-y-0.5"
            >
              Order Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              id="hero-signup"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-base px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-200"
            >
              Create Account
            </Link>
          </div>

          {/* Scroll hint */}
          <button
            onClick={() => scrollToSection(1)}
            className="mt-14 animate-bounce inline-flex flex-col items-center text-gray-400 hover:text-orange-500 transition-colors"
          >
            <span className="text-xs font-medium mb-1">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </Section>

      {/* ── Section 2: How It Works ──────────────────────────────────────── */}
      <Section
        index={1}
        onVisible={handleVisible}
        className="bg-white flex items-center justify-center"
      >
        <div className="max-w-5xl mx-auto px-6 w-full py-8">
          <div className="text-center mb-10">
            <span className="text-orange-500 font-semibold text-xs uppercase tracking-widest">Simple as 1-2-3</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">How Prebite Works</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">From browsing to biting — your canteen food journey, streamlined.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 z-0" />

            <StepCard
              step="1" icon={Smartphone}
              title="Browse the Menu"
              desc="Explore today's canteen offerings — biryanis, thalis, snacks, and drinks. Add your favourites to your cart instantly."
              color="bg-gradient-to-br from-orange-400 to-orange-600"
            />
            <StepCard
              step="2" icon={Clock}
              title="Pick Your Slot"
              desc="Choose a convenient pickup time — starting 15 minutes from now. No more standing in a queue during your break."
              color="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <StepCard
              step="3" icon={CheckCircle}
              title="Pay & Collect"
              desc="Pay securely via Razorpay. Walk up to the counter at your time, show your QR code, and walk away with your meal."
              color="bg-gradient-to-br from-green-400 to-emerald-500"
            />
          </div>
        </div>
      </Section>

      {/* ── Section 3: Features ──────────────────────────────────────────── */}
      <Section
        index={2}
        onVisible={handleVisible}
        className="bg-gray-50 flex items-center justify-center"
      >
        <div className="max-w-5xl mx-auto px-6 w-full py-8">
          <div className="text-center mb-10">
            <span className="text-orange-500 font-semibold text-xs uppercase tracking-widest">Built for Students</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Why Choose Prebite?</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">Everything you need for a stress-free canteen experience on campus.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Zap} delay="0ms"
              title="Save Your Break Time"
              desc="No more wasting 20 minutes in the canteen queue. Order ahead, show up on time."
            />
            <FeatureCard
              icon={Smartphone} delay="80ms"
              title="Order from Anywhere"
              desc="In class, hostel, or library — place your order from anywhere on campus."
            />
            <FeatureCard
              icon={CheckCircle} delay="160ms"
              title="Real-Time Tracking"
              desc="Watch your order status change live — from Preparing → Ready → Collected."
            />
            <FeatureCard
              icon={ShieldCheck} delay="240ms"
              title="Secure Payments"
              desc="Powered by Razorpay. Pay with UPI, cards, or wallets — 100% secure."
            />
          </div>

          {/* Food highlights strip */}
          <div className="mt-8 flex justify-center flex-wrap gap-2">
            {['🍱 Thali', '🍔 Burgers', '🥗 Salads', '🍜 Noodles', '🥙 Wraps', '🧃 Drinks', '🍩 Snacks', '☕ Tea & Coffee'].map(item => (
              <span key={item} className="bg-white border border-orange-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-default">
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Section 4: Social Proof ──────────────────────────────────────── */}
      <Section
        index={3}
        onVisible={handleVisible}
        className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 overflow-hidden flex items-center justify-center"
      >
        <FloatingEmoji emoji="❤️" style={{ top: '10%', right: '8%', animationDuration: '6s', opacity: 0.15 }} />
        <FloatingEmoji emoji="⭐" style={{ bottom: '15%', left: '6%', animationDuration: '8s', animationDelay: '2s', opacity: 0.15 }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 w-full py-8">
          <div className="text-center mb-10">
            <span className="text-orange-200 font-semibold text-xs uppercase tracking-widest">Real Students, Real Reviews</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Loved by Campus</h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <StatCard value="2,400+" label="Orders Placed" />
            <StatCard value="18 min" label="Avg. Time Saved" />
            <StatCard value="98%" label="Payment Success" />
            <StatCard value="4.9★" label="Student Rating" />
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Testimonial
              name="Rohan Mehta" dept="CSE, 3rd Year" rating={5}
              quote="I order my lunch during the first break and pick it up between classes. Zero queue. This is genuinely a game changer for busy days."
            />
            <Testimonial
              name="Priya Sharma" dept="ECE, 2nd Year" rating={5}
              quote="The QR code pickup is so smooth. The canteen staff scan it and immediately hand over my thali. Love it!"
            />
            <Testimonial
              name="Aditi Nair" dept="MBA, 1st Year" rating={5}
              quote="Razorpay UPI works perfectly. Paid in 2 seconds and my order was confirmed instantly. Finally a canteen app that actually works."
            />
          </div>
        </div>
      </Section>

      {/* ── Section 5: CTA ───────────────────────────────────────────────── */}
      <Section
        index={4}
        onVisible={handleVisible}
        className="bg-gray-900 relative overflow-hidden flex items-center justify-center"
      >
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        <FloatingEmoji emoji="🍽️" style={{ top: '12%', left: '5%', animationDuration: '7s', opacity: 0.12 }} />
        <FloatingEmoji emoji="🥘" style={{ bottom: '14%', right: '5%', animationDuration: '9s', animationDelay: '3s', opacity: 0.12 }} />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-orange-500/30">
            🚀 Join the Smart Canteen Revolution
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
            Ready to Skip<br />
            <span className="text-gradient-warm">the Queue?</span>
          </h2>
          <p className="text-gray-400 text-base mb-8 leading-relaxed">
            Join thousands of students who've ditched the canteen line. Sign up free — it only takes 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              id="cta-get-started"
              className="group inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-base px-8 py-3 rounded-xl shadow-lg shadow-orange-900/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/menu"
              id="cta-browse-menu"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-base px-8 py-3 rounded-xl border border-white/20 transition-all duration-200"
            >
              Browse Menu
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Razorpay Secured</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-500" /> Free to Use</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Instant Confirmation</span>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default HomePage;
