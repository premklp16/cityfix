import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const stringToColor = (str) => {
    let hash = 0;
    if (!str) return '#3b82f6'; // default blue
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`}
      />
    );
  }

  const bgColor = stringToColor(name);

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
