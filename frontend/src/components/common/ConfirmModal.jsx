import React from 'react';
import { X } from 'lucide-react';
const ConfirmModal = ({
                          isOpen,
                          onClose,
                          onConfirm,
                          title,
                          message,
                          confirmText = 'Confirmer',
                          cancelText = 'Annuler',
                          icon
                      }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-lg font-medium text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-4">
                        {icon && <div className="mr-4">{icon}</div>}
                        <p className="text-slate-600">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t border-slate-200 gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;