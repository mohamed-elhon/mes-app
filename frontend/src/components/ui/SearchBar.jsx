import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks';
import { apiPaginatedCall } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';

const SearchBar = React.forwardRef(({
  placeholder = 'Search products...',
  onSearch,
  onClose,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 1) {
      const fetchSuggestions = async () => {
        try {
          setLoading(true);
          const response = await apiPaginatedCall(API_ENDPOINTS.PRODUCTS.SEARCH, {
            query: debouncedQuery,
            limit: 5
          });
          setSuggestions(response.data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?query=${encodeURIComponent(query)}`);
      }
      setShowSuggestions(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    setQuery('');
    setShowSuggestions(false);
    navigate(`/products/${product._id || product.id}`);
  };

  // Handle blur
  const handleBlur = () => {
    // Use setTimeout to allow click event on suggestion to fire first
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onClose) onClose();
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div ref={ref} className={`relative ${className}`} {...props}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          
          <input
            ref={ref}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${inputClassName}`}
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((product) => (
            <button
              key={product._id || product.id}
              onClick={() => handleSuggestionClick(product)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
            >
              {product.images?.[0]?.url && (
                <img 
                  src={product.images[0].url} 
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                  {product.name}
                </div>
                {product.category && (
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {product.category.name || product.category}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded mb-2" />
              <div className="h-2 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
