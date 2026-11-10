import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../../utils/constants';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  LogOut,
  LogIn,
  ChevronLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const MobileMenu = ({ isOpen, onClose, user, isAuthenticated, onLogout }) => {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  if (!isOpen) return null;

  return (
    <div className="mobile-menu">
      <div className="flex-between mb-4">
        <h3 className="font-semibold text-gray-900">Menu</h3>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <nav className="space-y-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            onClick={onClose}
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {link.name}
          </Link>
        ))}

        <div className="pt-4 border-t border-gray-200 mt-4">
          <h4 className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
            Account
          </h4>
          
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Heart className="w-5 h-5" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
