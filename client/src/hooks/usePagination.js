import { useState, useMemo } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const nextPage = () => {
    if (hasNext) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (hasPrev) setPage((p) => p - 1);
  };

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  };
};
