import React from 'react';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  name,
  children,
  ...rest
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input bg-no-repeat appearance-none ${error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20' : ''
          } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: `right 0.5rem center`,
          backgroundSize: `1.5em 1.5em`,
          paddingRight: `2.5rem`
        }}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
  );
};

export default Select;
