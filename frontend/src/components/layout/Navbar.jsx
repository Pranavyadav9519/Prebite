import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Prebite</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link to="/menu" className="text-gray-600 hover:text-primary-500 transition-colors">
              Menu
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative text-gray-600 hover:text-primary-500 transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary-500 transition-colors">
                    Admin
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-500">
                    <User className="w-5 h-5" />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <Link to="/my-orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-primary-500">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-500"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/menu" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                Menu
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="text-gray-600 hover:text-primary-500 flex items-center" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/my-orders" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                    My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-red-600 flex items-center">
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

