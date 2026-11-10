import React from 'react';
import { motion } from 'framer-motion';

const Badge = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props
}, ref) => {
  // Define variants
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info',
    light: 'badge bg-gray-100 text-gray-800',
    dark: 'badge bg-gray-800 text-gray-100',
  };

  // Define sizes
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
    xl: 'px-4 py-1.5 text-sm',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <motion.span
      ref={ref}
      className={`badge ${variantClass} ${sizeClass} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 bg-current rounded-full mr-1" />
      )}
      {children}
    </motion.span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
