import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = React.forwardRef(({
  variant = 'rectangular',
  width = '100%',
  height,
  className = '',
  animation = true,
  ...props
}, ref) => {
  // Define variants
  const variants = {
    rectangular: '',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    text: 'rounded',
    title: 'rounded',
  };

  const variantClass = variants[variant] || variants.rectangular;

  // Define animation
  const skeletonVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: { backgroundPosition: '200% 0' },
  };

  // Define styles based on variant
  let style = {};
  if (variant === 'circular') {
    style = { width, height, borderRadius: '50%' };
  } else if (variant === 'text') {
    style = { width, height: height || '1rem' };
  } else if (variant === 'title') {
    style = { width, height: height || '1.5rem' };
  } else {
    style = { width, height };
  }

  return (
    <motion.div
      ref={ref}
      className={`skeleton ${variantClass} ${className}`}
      initial={animation ? 'initial' : false}
      animate={animation ? 'animate' : false}
      variants={skeletonVariants}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={style}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Skeleton variants
const SkeletonText = React.forwardRef(({
  lines = 1,
  width = '100%',
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`space-y-2 ${className}`} ref={ref} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '75%' : width}
          height="1rem"
        />
      ))}
    </div>
  );
});

SkeletonText.displayName = 'SkeletonText';

const SkeletonTitle = React.forwardRef(({
  width = '60%',
  className = '',
  ...props
}, ref) => {
  return (
    <Skeleton
      ref={ref}
      variant="title"
      width={width}
      height="1.5rem"
      className={className}
      {...props}
    />
  );
});

SkeletonTitle.displayName = 'SkeletonTitle';

const SkeletonImage = React.forwardRef(({
  width = '100%',
  height = '200px',
  className = '',
  ...props
}, ref) => {
  return (
    <Skeleton
      ref={ref}
      variant="rectangular"
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
});

SkeletonImage.displayName = 'SkeletonImage';

const SkeletonAvatar = React.forwardRef(({
  size = 40,
  className = '',
  ...props
}, ref) => {
  return (
    <Skeleton
      ref={ref}
      variant="circular"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
});

SkeletonAvatar.displayName = 'SkeletonAvatar';

// Skeleton for product card
const SkeletonProductCard = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`card ${className}`} {...props}>
      <SkeletonImage className="mb-4" />
      <SkeletonTitle className="mb-2" />
      <SkeletonText lines={2} />
      <div className="flex-between mt-4">
        <Skeleton width="40%" height="1.5rem" />
        <Skeleton width="30%" height="2rem" />
      </div>
    </div>
  );
});

SkeletonProductCard.displayName = 'SkeletonProductCard';

// Export all components
export {
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonImage,
  SkeletonAvatar,
  SkeletonProductCard,
};
