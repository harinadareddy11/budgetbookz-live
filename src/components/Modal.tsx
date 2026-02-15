import React from 'react';
import { BsX, BsCheckCircle, BsXCircle } from 'react-icons/bs';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  type = 'info',
  title, 
  message,
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center mb-4">
          {type === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BsCheckCircle className="text-3xl text-green-600" />
            </div>
          )}
          {type === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BsXCircle className="text-3xl text-red-600" />
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        {children || (
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition-colors"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
};
