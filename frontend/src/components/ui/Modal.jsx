import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Modal = React.forwardRef(({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  titleClassName = '',
  bodyClassName = '',
  footer,
  ...props
}, ref) => {
  const { theme } = useTheme();

  // Define sizes
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  const sizeClass = sizes[size] || sizes.md;

  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (closeOnEscape && e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose, closeOnEscape]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Add event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Modal animation
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Overlay animation
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          aria-hidden="true"
        />

        {/* Modal Content */}
        <motion.div
          ref={ref}
          key="modal-content"
          className={`relative w-full ${sizeClass} bg-white dark:bg-gray-900 rounded-xl shadow-xl ${contentClassName}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`flex-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${headerClassName}`}>
              {title && (
                <h2 className={`text-xl font-semibold text-gray-900 dark:text-white ${titleClassName}`}>
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={`p-6 ${bodyClassName}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

Modal.displayName = 'Modal';

export default Modal;
