import { CheckCircle2, CreditCard, ChefHat, Package, ShoppingBag } from 'lucide-react';

const steps = [
  { key: 'PENDING_PAYMENT', label: 'Pending Payment', icon: CreditCard },
  { key: 'PAID', label: 'Paid', icon: ShoppingBag },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { key: 'READY', label: 'Ready', icon: Package },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 }
];

const OrderTimeline = ({ currentStatus }) => {
  const normalizedStatus = {
    placed: 'PENDING_PAYMENT',
    confirmed: 'PAID',
    preparing: 'PREPARING',
    ready: 'READY',
    picked_up: 'COMPLETED'
  }[currentStatus] || currentStatus;
  const currentIndex = Math.max(steps.findIndex(step => step.key === normalizedStatus), 0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary-500 -z-10 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className={`mt-2 text-xs text-center ${isCurrent ? 'font-semibold text-primary-500' : 'text-gray-500'}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;

