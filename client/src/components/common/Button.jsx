import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) => {
  const baseClasses = 'btn';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[38px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[52px]',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    loading ? 'pointer-events-none opacity-80' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {!loading && icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
