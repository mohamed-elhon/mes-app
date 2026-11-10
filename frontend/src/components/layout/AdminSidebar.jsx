import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ADMIN_NAV_LINKS } from '../../utils/constants';
import { 
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Ticket,
  MessageSquare,
  Settings,
  ChevronLeft,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Icon mapping
const ICONS = {
  dashboard: LayoutDashboard,
  products: Package,
  categories: Tag,
  orders: ShoppingCart,
  users: Users,
  coupons: Ticket,
  reviews: MessageSquare,
  contacts: MessageSquare,
  settings: Settings,
};

const AdminSidebar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <div className="font-bold text-xl text-gray-900 dark:text-white">
              Admin Panel
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {ADMIN_NAV_LINKS.map((link) => {
              const Icon = ICONS[link.icon] || Package;
              const isActive = location.pathname === link.href || 
                              location.pathname.startsWith(`${link.href}/`);
              
              return (
                <li key={link.name}>
                  <NavLink
                    to={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' 
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-primary-600' : 'text-gray-500'
                    }`} />
                    {!isCollapsed && (
                      <span className="font-medium">{link.name}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Button (Mobile) */}
        <div className="lg:hidden p-4">
          <button
            onClick={toggleSidebar}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {isCollapsed ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {!isCollapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default AdminSidebar;
