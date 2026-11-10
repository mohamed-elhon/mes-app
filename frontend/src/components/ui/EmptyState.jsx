import React from 'react';
import { Package, ShoppingCart, Heart, User, Search, FileText } from 'lucide-react';
import Button from './Button';

// Icon mapping
const ICONS = {
  products: Package,
  cart: ShoppingCart,
  wishlist: Heart,
  orders: FileText,
  users: User,
  search: Search,
  default: Package,
};

// Default messages
const DEFAULT_MESSAGES = {
  products: {
    title: 'No products found',
    description: 'Sorry, we couldn\'t find any products matching your search.',
  },
  cart: {
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added anything to your cart yet.',
  },
  wishlist: {
    title: 'Your wishlist is empty',
    description: 'Start adding products you love to your wishlist.',
  },
  orders: {
    title: 'No orders found',
    description: 'You haven\'t placed any orders yet.',
  },
  users: {
    title: 'No users found',
    description: 'There are no users matching your criteria.',
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
  default: {
    title: 'Nothing to see here',
    description: 'There is no data available at the moment.',
  },
};

const EmptyState = React.forwardRef(({
  type = 'default',
  title,
  description,
  icon: Icon,
  action,
  actionText = 'Continue Shopping',
  className = '',
  ...props
}, ref) => {
  // Get icon
  const SelectedIcon = Icon || ICONS[type] || ICONS.default;
  
  // Get messages
  const messages = DEFAULT_MESSAGES[type] || DEFAULT_MESSAGES.default;
  const displayTitle = title || messages.title;
  const displayDescription = description || messages.description;

  return (
    <div 
      ref={ref}
      className={`empty-state ${className}`}
      {...props}
    >
      <div className="empty-state-icon text-gray-400">
        <SelectedIcon className="w-16 h-16" />
      </div>
      <h3 className="empty-state-title">{displayTitle}</h3>
      <p className="empty-state-text">{displayDescription}</p>
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          className="mt-6"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
