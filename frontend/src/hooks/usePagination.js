import { useState, useCallback } from 'react';

const usePagination = (initialPage = 1, initialLimit = 10, initialTotal = 0) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(initialTotal);

  // Calculate derived values
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const nextPage = hasNext ? page + 1 : null;
  const prevPage = hasPrev ? page - 1 : null;
  const offset = (page - 1) * limit;

  // Change page
  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  // Next page
  const next = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  // Previous page
  const prev = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [hasPrev]);

  // Change limit
  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  // Update total (when data changes)
  const updateTotal = useCallback((newTotal) => {
    setTotal(newTotal);
  }, []);

  // Reset pagination
  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(initialTotal);
  }, [initialPage, initialLimit, initialTotal]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    offset,
    goToPage,
    next,
    prev,
    changeLimit,
    updateTotal,
    reset,
    setPage,
    setLimit,
    setTotal,
  };
};

export default usePagination;
