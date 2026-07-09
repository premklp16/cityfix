import React from 'react';

const Badge = ({ text, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-danger-100 text-danger-800',
    info: 'bg-cyan-100 text-cyan-800',
    purple: 'bg-violet-100 text-violet-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`badge ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
