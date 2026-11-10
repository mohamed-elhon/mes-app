import React from 'react';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'p-6',
  className = '',
  hoverable = false,
  clickable = false,
  onClick,
  ...props
}, ref) => {
  // Define variants
  const variants = {
    default: 'bg-white border border-gray-100',
    primary: 'bg-primary-50 border border-primary-200',
    secondary: 'bg-gray-50 border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-200',
    flat: 'bg-gray-50',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20',
    dark: 'bg-gray-900 border border-gray-800',
  };

  const variantClass = variants[variant] || variants.default;

  // Handle click
  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`card rounded-xl ${variantClass} ${padding} ${className}`}
      whileHover={hoverable ? { y: -4, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' } : {}}
      onClick={handleClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

// Card Header component
const CardHeader = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`mb-4 pb-4 border-b border-gray-200 dark:border-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

// Card Title component
const CardTitle = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <h3 
      ref={ref}
      className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

// Card Description component
const CardDescription = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <p 
      ref={ref}
      className={`text-gray-600 dark:text-gray-400 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

// Card Content component
const CardContent = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={` ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

// Card Footer component
const CardFooter = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

// Export all components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
