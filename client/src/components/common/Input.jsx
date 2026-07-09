import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  disabled = false,
  className = '',
  name,
  showPasswordToggle = false,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === 'password' && showPasswordToggle;
  const inputType = isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type;
  const hasRightToggle = isPasswordField;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-800 mb-2">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`input ${icon ? 'pl-12' : ''} ${hasRightToggle ? 'pr-12' : ''} ${error ? 'input-error' : ''} ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
          {...rest}
        />
        {hasRightToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(prev => !prev)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 transition-colors hover:text-slate-700"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
    </div>
  );
};

export default Input;
