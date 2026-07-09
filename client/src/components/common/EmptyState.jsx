import React from 'react';
import Button from './Button';

const EmptyState = ({
  title = 'No Data Found',
  message = 'There is currently nothing to display here.',
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${className}`}>
      {icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 text-5xl">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="max-w-md text-sm leading-6 text-slate-600">{message}</p>

      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
