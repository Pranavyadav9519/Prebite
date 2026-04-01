import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

const fallbackImage = '/fallback-food.svg';

const MenuCard = ({ item, onSelect }) => {
  const { items, addItem, updateQuantity } = useCartStore();
  
  const cartItem = items.find(ci => ci.menuItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    } else {
      updateQuantity(item.id, 0);
    }
  };

  return (
    <div 
      className={`card hover:shadow-lg transition-shadow cursor-pointer ${!item.isAvailable ? 'opacity-60' : ''}`}
      onClick={() => onSelect && onSelect(item)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.imageUrl || fallbackImage}
          alt={item.name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
          className="w-full h-full object-cover"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Sold Out</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-primary-500">
          ₹{item.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{item.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase font-medium">{item.category}</span>
          
          {item.isAvailable ? (
            quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="btn-primary flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-primary-50 rounded-lg p-1">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-primary-500 hover:bg-primary-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-primary-500 hover:bg-primary-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            <button disabled className="btn-secondary cursor-not-allowed">
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;

