import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Info,
  AlertTriangle,
  X
} from 'lucide-react';

// Toast variants
const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-success-light text-success-dark',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-error-light text-error-dark',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning-light text-warning-dark',
  },
  info: {
    icon: Info,
    className: 'bg-primary-50 text-primary-800',
  },
};

// Show toast function
const showToast = (message, options = {}) => {
  const { type = 'info', duration = 4000, ...rest } = options;
  const variant = toastVariants[type] || toastVariants.info;
  
  return toast.custom(
    ({ visible }) => (
      <div
        className={`rounded-lg shadow-lg p-4 border border-${type}-200 ${variant.className} ${
          visible ? 'animate-enter' : 'animate-leave'
        }`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}
      >
        <div className="flex items-start gap-3">
          <variant.icon className={`w-5 h-5 ${type === 'info' ? 'text-primary-600' : `text-${type}-600`}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss()}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ),
    { duration, ...rest }
  );
};

// Toast component with predefined types
const Toast = {
  success: (message, options = {}) => showToast(message, { type: 'success', ...options }),
  error: (message, options = {}) => showToast(message, { type: 'error', ...options }),
  warning: (message, options = {}) => showToast(message, { type: 'warning', ...options }),
  info: (message, options = {}) => showToast(message, { type: 'info', ...options }),
  
  // Custom toast
  custom: (content, options = {}) => toast.custom(content, options),
  
  // Dismiss all
  dismiss: () => toast.dismiss(),
  
  // Toaster component
  Toaster: Toaster,
};

export default Toast;
