import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="modal-overlay" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className={`modal-card relative z-10 ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-slide-up`}
      >
        <div className="modal-header flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
