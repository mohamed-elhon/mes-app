import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { SITE_NAME, NAV_LINKS } from '../../utils/constants';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Search, 
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  LogIn
} from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle search
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav 
        className={`navbar transition-all duration-300 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            {SITE_NAME}
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`navbar-link ${
                  location.pathname === link.href ? 'text-primary-600' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Search Toggle (Mobile) */}
            <button
              onClick={toggleSearch}
              className="btn-icon lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="btn-icon relative hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="btn-icon relative hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="btn-icon hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-icon hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-button lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:block px-4 pb-4">
          <SearchBar />
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden px-4 pb-4">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </nav>

      {/* Mobile Menu (separate component) */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
