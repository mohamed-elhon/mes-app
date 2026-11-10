import React from 'react';

const Radio = React.forwardRef(({
  name,
  value,
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
  const radioRef = React.useRef(null);

  // Combine refs
  React.useImperativeHandle(ref, () => radioRef.current);

  // Handle change
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <input
          ref={radioRef}
          type="radio"
          id={`${name}-${value}`}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`w-5 h-5 rounded-full border-2 appearance-none cursor-pointer transition-colors duration-200 ${
            disabled 
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
              : checked 
                ? 'border-primary-600 bg-primary-600' 
                : 'border-gray-300 bg-white hover:border-primary-500'
          } ${error ? 'border-error-500' : ''}`}
          {...props}
        />
        {checked && !disabled && (
          <div className="absolute inset-1 rounded-full bg-primary-600" />
        )}
      </div>
      
      {label && (
        <label 
          htmlFor={`${name}-${value}`}
          className={`text-sm text-gray-700 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${labelClassName}`}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

// Radio Group component
const RadioGroup = React.forwardRef(({
  name,
  value,
  onChange,
  onBlur,
  options = [],
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  labelClassName = '',
  errorClassName = '',
  direction = 'vertical', // 'vertical' or 'horizontal'
  ...props
}, ref) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          className={`label ${labelClassName} ${required ? 'after:content-[\'*\'] after:text-red-500 after:ml-1' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className={`flex ${direction === 'horizontal' ? 'flex-wrap gap-6' : 'flex-col gap-2'}`}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            onBlur={onBlur}
            label={option.label}
            disabled={disabled || option.disabled}
            required={required}
            {...props}
          />
        ))}
      </div>
      
      {error && (
        <p className={`form-error ${errorClassName}`}>
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };
