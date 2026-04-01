import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

const fallbackImage = '/fallback-food.svg';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem, updateNotes } = useCartStore();

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.menuItem.imageUrl || fallbackImage}
            alt={item.menuItem.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{item.menuItem.name}</h3>
              <p className="text-sm text-gray-500">{item.menuItem.category}</p>
            </div>
            <button
              onClick={() => removeItem(item.menuItem.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Notes */}
          <div className="mt-2">
            <input
              type="text"
              placeholder="Special instructions..."
              value={item.notes || ''}
              onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-between items-center mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-sm text-gray-500">
                ₹{item.menuItem.price} × {item.quantity}
              </p>
              <p className="font-semibold text-primary-500">
                ₹{(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

