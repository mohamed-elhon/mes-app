import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { generateStarRating } from '../../utils/helpers';

const Rating = React.forwardRef(({
  value = 0,
  max = 5,
  size = 'md',
  editable = false,
  onChange,
  className = '',
  starClassName = '',
  ...props
}, ref) => {
  // Define sizes
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const sizeClass = sizes[size] || sizes.md;

  // Generate star array
  const stars = generateStarRating(value, max);

  // Handle click on star
  const handleClick = (index) => {
    if (editable && onChange) {
      const newValue = index + 1;
      onChange(newValue);
    }
  };

  return (
    <div 
      ref={ref}
      className={`rating ${className}`}
      {...props}
    >
      {stars.map((star, index) => {
        const key = `star-${index}`;
        
        if (star === 'full') {
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!editable}
              className={`rating-star text-yellow-400 ${sizeClass} ${starClassName}`}
              aria-label={`Rate ${index + 1} out of ${max}`}
            >
              <Star className="fill-current" />
            </button>
          );
        }
        
        if (star === 'half') {
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!editable}
              className={`rating-star text-yellow-400 ${sizeClass} ${starClassName}`}
              aria-label={`Rate ${index + 0.5} out of ${max}`}
            >
              <StarHalf className="fill-current" />
            </button>
          );
        }
        
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!editable}
            className={`rating-star text-gray-300 ${sizeClass} ${starClassName}`}
            aria-label={`Rate ${index + 1} out of ${max}`}
          >
            <Star className="fill-current" />
          </button>
        );
      })}
    </div>
  );
});

Rating.displayName = 'Rating';

// Rating with text
const RatingWithText = React.forwardRef(({
  value = 0,
  max = 5,
  size = 'md',
  showValue = true,
  showMax = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`flex items-center gap-2 ${className}`} {...props}>
      <Rating value={value} max={max} size={size} />
      {showValue && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value.toFixed(1)}
        </span>
      )}
      {showValue && showMax && (
        <span className="text-sm text-gray-400">/ {max}</span>
      )}
    </div>
  );
});

RatingWithText.displayName = 'RatingWithText';

// Export components
export { Rating, RatingWithText };
