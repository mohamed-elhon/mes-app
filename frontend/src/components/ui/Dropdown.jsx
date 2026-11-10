import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Dropdown = React.forwardRef(({
  children,
  trigger,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = 'bottom-start',
  className = '',
  overlayClassName = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Determine if dropdown is controlled
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : isOpen;

  // Handle open change
  const handleOpenChange = (newOpen) => {
    if (!isControlled) {
      setIsOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        handleOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleOpenChange]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        handleOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleOpenChange]);

  // Calculate position based on placement
  const getPositionClasses = () => {
    const placements = {
      'top-start': 'bottom-full left-0 mb-2',
      'top-end': 'bottom-full right-0 mb-2',
      'bottom-start': 'top-full left-0 mt-2',
      'bottom-end': 'top-full right-0 mt-2',
      'left-start': 'right-full top-0 mr-2',
      'left-end': 'right-full bottom-0 mr-2',
      'right-start': 'left-full top-0 ml-2',
      'right-end': 'left-full bottom-0 ml-2',
    };
    return placements[placement] || placements['bottom-start'];
  };

  // Animation
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: placement.startsWith('top') ? 10 : placement.startsWith('bottom') ? -10 : 0,
      x: placement.startsWith('left') ? 10 : placement.startsWith('right') ? -10 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  // Clone trigger with ref and onClick
  const triggerElement = React.isValidElement(trigger) ? (
    React.cloneElement(trigger, {
      ref: triggerRef,
      onClick: (e) => {
        handleOpenChange(!open);
        if (trigger.props.onClick) {
          trigger.props.onClick(e);
        }
      },
    })
  ) : (
    <button
      ref={triggerRef}
      onClick={() => handleOpenChange(!open)}
      className="btn-secondary"
    >
      Toggle Dropdown
      {open ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
    </button>
  );

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`} {...props}>
      {triggerElement}
      
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className={`fixed z-50 dropdown-menu ${getPositionClasses()} ${overlayClassName}`}
            style={{ minWidth: triggerRef.current?.offsetWidth || 'auto' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

// DropdownMenu component
const DropdownMenu = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});

DropdownMenu.displayName = 'DropdownMenu';

// DropdownItem component
const DropdownItem = React.forwardRef(({
  children,
  onClick,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`dropdown-item ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
});

DropdownItem.displayName = 'DropdownItem';

// DropdownDivider component
const DropdownDivider = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`border-t border-gray-200 dark:border-gray-700 my-1 ${className}`}
      {...props}
    />
  );
});

DropdownDivider.displayName = 'DropdownDivider';

// DropdownHeader component
const DropdownHeader = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownHeader.displayName = 'DropdownHeader';

// Export all components
export {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
};
