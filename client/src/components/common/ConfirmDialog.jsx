import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}) => {
  const iconColor = confirmVariant === 'danger' ? 'text-danger-500' : 'text-amber-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center pb-2">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-sm">
          <FaExclamationTriangle className="text-2xl" />
        </div>
        <p className="text-sm leading-6 text-slate-600">{message}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
