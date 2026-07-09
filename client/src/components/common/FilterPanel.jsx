import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import Select from './Select';
import { CATEGORIES, STATUSES, SEVERITIES } from '../../utils/constants';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...CATEGORIES.map(c => ({ value: c, label: c }))
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...STATUSES.map(s => ({ value: s, label: s }))
  ];

  const severityOptions = [
    { value: '', label: 'All Severities' },
    ...SEVERITIES.map(s => ({ value: s, label: s }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most-upvoted', label: 'Most Upvoted' },
  ];

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <FaFilter className="text-gray-400" />
          <span>Filters & Sorting</span>

          {/* Active filters count */}
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span className="ml-2 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {Object.values(filters).filter(v => v !== '' && v !== 'newest').length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {Object.values(filters).some(v => v !== '' && v !== 'newest') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="text-xs text-danger-600 hover:text-danger-700 font-medium hidden sm:block"
            >
              Clear All
            </button>
          )}
          <span className="text-gray-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : '' }}>
            ▼
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-gray-100 bg-gray-50 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={filters.category || ''}
              onChange={(e) => onFilterChange('category', e.target.value)}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
            />
            <Select
              label="Severity"
              options={severityOptions}
              value={filters.severity || ''}
              onChange={(e) => onFilterChange('severity', e.target.value)}
            />
            <Select
              label="Sort By"
              options={sortOptions}
              value={filters.sort || 'newest'}
              onChange={(e) => onFilterChange('sort', e.target.value)}
            />
          </div>
          <div className="mt-4 sm:hidden flex justify-end">
            <button
              onClick={onReset}
              className="text-sm text-danger-600 hover:text-danger-700 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
