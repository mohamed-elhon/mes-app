import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Tabs = React.forwardRef(({
  children,
  defaultValue,
  value: controlledValue,
  onChange,
  className = '',
  ...props
}, ref) => {
  const [activeTab, setActiveTab] = useState(defaultValue || (children[0]?.props?.value || 0));

  // Determine if tabs are controlled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : activeTab;

  // Handle tab change
  const handleTabChange = (newValue) => {
    if (!isControlled) {
      setActiveTab(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  // Clone children and add active prop
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        active: child.props.value === value,
        onClick: () => handleTabChange(child.props.value),
      });
    }
    return child;
  });

  return (
    <div ref={ref} className={`tabs-container ${className}`} {...props}>
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {childrenWithProps}
      </div>
    </div>
  );
});

Tabs.displayName = 'Tabs';

// Tab component
const Tab = React.forwardRef(({
  children,
  value,
  active = false,
  onClick,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={`tab-button ${active ? 'tab-button-active' : 'tab-button-inactive'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Tab.displayName = 'Tab';

// TabPanel component
const TabPanel = React.forwardRef(({
  children,
  value,
  activeValue,
  className = '',
  ...props
}, ref) => {
  const isActive = value === activeValue;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isActive ? 1 : 0, 
        y: isActive ? 0 : 10 
      }}
      transition={{ duration: 0.2 }}
      className={`p-4 ${className}`}
      {...props}
    >
      {isActive && children}
    </motion.div>
  );
});

TabPanel.displayName = 'TabPanel';

// Export all components
export { Tabs, Tab, TabPanel };
