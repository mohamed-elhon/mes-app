import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = React.forwardRef(({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputRef = React.useRef(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // Combine refs
  React.useImperativeHandle(ref, () => inputRef.current);

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

  // Toggle password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Determine input type
  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className={`label ${labelClassName} ${required ? 'after:content-[\'*\] after:text-red-500 after:ml-1' : ''}`}
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
        
        <input
          ref={inputRef}
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input ${inputClassName} ${LeftIcon ? 'pl-10' : ''} ${RightIcon || (showPasswordToggle && (type === 'password')) ? 'pr-10' : ''} ${error ? 'input-error' : ''} ${isFocused ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
        
        {RightIcon && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <RightIcon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {error && (
        <p className={`form-error ${errorClassName}`}>
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
