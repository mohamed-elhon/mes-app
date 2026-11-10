import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef(({
  name,
  checked,
  onChange,
  onBlur,
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  labelClassName = '',
  errorClassName = '',
  ...props
}, ref) => {
  const checkboxRef = React.useRef(null);

  // Combine refs
  React.useImperativeHandle(ref, () => checkboxRef.current);

  // Handle change
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative">
        <input
          ref={checkboxRef}
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`w-5 h-5 rounded border-2 appearance-none cursor-pointer transition-colors duration-200 ${
            disabled 
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
              : checked 
                ? 'border-primary-600 bg-primary-600' 
                : 'border-gray-300 bg-white hover:border-primary-500'
          } ${error ? 'border-error-500' : ''}`}
          {...props}
        />
        {checked && !disabled && (
          <Check className="absolute top-0.5 left-0.5 w-3.5 h-3.5 text-white" />
        )}
      </div>
      
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
