import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle, 
  Info,
  AlertTriangle,
  X
} from 'lucide-react';

// Icon mapping
const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

// Color mapping
const COLORS = {
  success: {
    bg: 'bg-success-light',
    border: 'border-success',
    text: 'text-success-dark',
    icon: 'text-success',
  },
  error: {
    bg: 'bg-error-light',
    border: 'border-error',
    text: 'text-error-dark',
    icon: 'text-error',
  },
  warning: {
    bg: 'bg-warning-light',
    border: 'border-warning',
    text: 'text-warning-dark',
    icon: 'text-warning',
  },
  info: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-800',
    icon: 'text-primary-600',
  },
};

const Alert = React.forwardRef(({
  type = 'info',
  title,
  message,
  onClose,
  showIcon = true,
  dismissible = false,
  className = '',
  titleClassName = '',
  messageClassName = '',
  ...props
}, ref) => {
  const colors = COLORS[type] || COLORS.info;
  const Icon = ICONS[type] || Info;

  // Animation
  const alertVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      y: 10,
      transition: { duration: 0.2 }
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`alert ${colors.bg} ${colors.border} ${className}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={alertVariants}
      {...props}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={`flex-shrink-0 ${colors.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${colors.text} ${titleClassName}`}>
              {title}
            </h4>
          )}
          {message && (
            <p className={`text-sm ${colors.text} ${messageClassName}`}>
              {message}
            </p>
          )}
        </div>
        
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded hover:${colors.bg} transition-colors duration-200`}
            aria-label="Close alert"
          >
            <X className={`w-4 h-4 ${colors.text}`} />
          </button>
        )}
      </div>
    </motion.div>
  );
});

Alert.displayName = 'Alert';

export default Alert;
