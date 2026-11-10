import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';

const Breadcrumb = React.forwardRef(({
  items = [],
  separator = '/',
  className = '',
  itemClassName = '',
  linkClassName = '',
  activeClassName = '',
  separatorClassName = '',
  showHome = true,
  homeIcon: HomeIcon = Home,
  ...props
}, ref) => {
  // Build breadcrumb items
  const breadcrumbItems = showHome 
    ? [{ name: 'Home', href: '/' }, ...items] 
    : items;

  return (
    <nav 
      ref={ref}
      aria-label="Breadcrumb"
      className={`breadcrumb ${className}`}
      {...props}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isHome = index === 0 && showHome;

        return (
          <React.Fragment key={item.href || item.name}>
            {isHome && (
              <Link
                to={item.href}
                className={`breadcrumb-link hover:text-primary-600 ${linkClassName}`}
              >
                <HomeIcon className="w-4 h-4" />
              </Link>
            )}
            
            {!isHome && !isLast && (
              <Link
                to={item.href}
                className={`breadcrumb-link hover:text-primary-600 ${linkClassName}`}
              >
                {item.name}
              </Link>
            )}
            
            {!isHome && isLast && (
              <span className={`text-gray-500 ${activeClassName}`}>
                {item.name}
              </span>
            )}
            
            {/* Separator */}
            {index < breadcrumbItems.length - 1 && (
              <span className={`text-gray-400 mx-2 ${separatorClassName}`}>
                {typeof separator === 'string' ? separator : (
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                )}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

// BreadcrumbItem component for easier usage
const BreadcrumbItem = ({ name, href, icon: Icon }) => {
  return { name, href, Icon };
};

export { Breadcrumb, BreadcrumbItem };
