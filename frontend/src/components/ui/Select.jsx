import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = React.forwardRef(({
  name,
  value,
  onChange,
  onBlur,
  options = [],
  label,
  error,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  className = '',
  selectClassName = '',
  labelClassName = '',
  errorClassName = '',
  leftIcon: LeftIcon,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const selectRef = React.useRef(null);

  // Combine refs
  React.useImperativeHandle(ref, () => selectRef.current);

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className={`label ${labelClassName} ${required ? 'after:content-[\'*\'] after:text-red-500 after:ml-1' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <LeftIcon className="w-5 h-5" />
          </div>
        )}
        
        <select
          ref={selectRef}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          required={required}
          className={`input ${selectClassName} ${LeftIcon ? 'pl-10' : ''} pr-10 appearance-none bg-white ${error ? 'input-error' : ''} ${isFocused ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            if (option.group) {
              return (
                <optgroup key={option.label} label={option.label}>
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              );
            }
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      
      {error && (
        <p className={`form-error ${errorClassName}`}>
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
