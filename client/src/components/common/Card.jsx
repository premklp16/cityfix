import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-7',
    lg: 'p-8 sm:p-10',
  };

  const hoverClasses = hover
    ? 'hover:shadow-hover hover:-translate-y-0.5 transition-transform duration-300 cursor-pointer'
    : '';

  const classes = [
    'card',
    paddingClasses[padding],
    hoverClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
