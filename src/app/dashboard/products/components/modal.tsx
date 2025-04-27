'use client';
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 z-50 flex items-start justify-center px-6 py-6 pt-10 overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className="bg-white rounded-lg shadow-xl transform transition-all sm:max-lg w-3xl z-50"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="px-6 py-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
