import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { usePagination } from '../../hooks';

const Pagination = React.forwardRef(({
  total = 0,
  page: controlledPage = 1,
  limit: controlledLimit = 10,
  onPageChange,
  onLimitChange,
  showPageSizeChanger = false,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showQuickJumper = false,
  className = '',
  ...props
}, ref) => {
  const {
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  } = usePagination(controlledPage, controlledLimit, total);

  // Determine if pagination is controlled
  const isControlled = controlledPage !== undefined || controlledLimit !== undefined;

  // Handle page change
  const handlePageChange = (newPage) => {
    if (!isControlled) {
      goToPage(newPage);
    }
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    if (!isControlled) {
      changeLimit(newLimit);
    }
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis');
      }
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Current page (controlled or uncontrolled)
  const currentPage = isControlled ? controlledPage : page;
  const currentLimit = isControlled ? controlledLimit : limit;

  return (
    <div 
      ref={ref}
      className={`pagination ${className}`}
      {...props}
    >
      {/* Page size changer */}
      {showPageSizeChanger && (
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
          <select
            value={currentLimit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
        </div>
      )}

      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`pagination-button pagination-button-${hasPrev ? 'active' : 'inactive'}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((pageNumber, index) => {
        if (pageNumber === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="pagination-button pagination-button-inactive">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          );
        }

        return (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`pagination-button ${
              pageNumber === currentPage ? 'pagination-button-active' : 'pagination-button-inactive'
            }`}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`pagination-button pagination-button-${hasNext ? 'active' : 'inactive'}`}
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Quick jumper */}
      {showQuickJumper && totalPages > 0 && (
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const newPage = Math.max(1, Math.min(totalPages, Number(e.target.value)));
              handlePageChange(newPage);
            }}
            className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">of {totalPages}</span>
        </div>
      )}
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
