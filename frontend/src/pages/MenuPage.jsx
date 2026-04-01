import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { menuApi } from '../api/menuApi';
import { useCartStore } from '../store/cartStore';
import MenuCard from '../components/menu/MenuCard';
import CategoryFilter from '../components/menu/CategoryFilter';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenuItems();
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      params.available = 'true';

      const response = await menuApi.getAll(params);
      setMenuItems(response.data.menuItems);

      // Fetch categories if not already loaded
      if (categories.length === 1) {
        const catResponse = await menuApi.getCategories();
        setCategories(catResponse.data.categories);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Menu</h1>
          <p className="text-gray-600">Browse and order your favorite canteen items</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchMenuItems} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !error && (
          <>
            {menuItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No menu items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <Link
            to="/cart"
            className="fixed bottom-6 right-6 bg-primary-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>View Cart</span>
            <span className="bg-white text-primary-500 px-2 py-0.5 rounded-full text-sm font-semibold">
              {cartCount}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MenuPage;

