import React from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = React.forwardRef(({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  textareaClassName = '',
  labelClassName = '',
  errorClassName = '',
  ...props
}, ref) => {
  const textareaRef = React.useRef(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // Combine refs
  React.useImperativeHandle(ref, () => textareaRef.current);

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
      
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`input ${textareaClassName} resize-vertical ${error ? 'input-error' : ''} ${isFocused ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
        {...props}
      />
      
      {error && (
        <p className={`form-error ${errorClassName}`}>
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
