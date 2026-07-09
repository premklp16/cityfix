import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <FaChevronLeft />
      </button>

      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex h-11 min-w-[44px] items-center justify-center rounded-2xl border text-sm font-medium transition ${currentPage === page
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm shadow-primary-500/20'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
