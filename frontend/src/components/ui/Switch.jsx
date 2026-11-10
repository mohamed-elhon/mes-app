import React from 'react';
import { motion } from 'framer-motion';

const Switch = React.forwardRef(({
  name,
  checked,
  onChange,
  onBlur,
  label,
  error,
  disabled = false,
  required = false,
  size = 'md',
  className = '',
  labelClassName = '',
  errorClassName = '',
  ...props
}, ref) => {
  const switchRef = React.useRef(null);

  // Combine refs
  React.useImperativeHandle(ref, () => switchRef.current);

  // Handle change
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e);
    }
  };

  // Define sizes
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const sizeConfig = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        ref={switchRef}
        type="button"
        role="switch"
        name={name}
        checked={checked}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`relative inline-flex items-center ${sizeConfig.track} rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${error ? 'ring-2 ring-error-500' : ''}`}
        onClick={(e) => {
          if (!disabled && onChange) {
            onChange({ 
              target: { 
                name, 
                value: !checked,
                checked: !checked,
                type: 'checkbox' 
              } 
            });
          }
          e.preventDefault();
        }}
        {...props}
      >
        <motion.span
          className={`absolute left-0.5 ${sizeConfig.thumb} bg-white rounded-full shadow-md`}
          animate={checked ? { x: sizeConfig.translate } : { x: 0 }}
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        />
      </button>
      
      {label && (
        <label 
          htmlFor={name}
          className={`text-sm text-gray-700 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {error && (
        <p className={`form-error ${errorClassName}`}>
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

export default Switch;
