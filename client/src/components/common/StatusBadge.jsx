import React from 'react';
import Badge from './Badge';
import { STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const variant = STATUS_COLORS[status] || 'default';

  return (
    <Badge
      text={status}
      variant={variant}
      size={size}
      className={className}
    />
  );
};

export default StatusBadge;
