import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
        <FaSearch />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-sm text-slate-700 shadow-sm transition duration-200 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
          aria-label="Clear search"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
