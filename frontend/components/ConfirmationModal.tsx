import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-slate-300 mb-6">{message}</p>
      <div className="flex justify-end items-center gap-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
}
