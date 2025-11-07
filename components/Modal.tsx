
import React from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-light-bg w-full max-w-md rounded-2xl shadow-2xl border border-border-color transform transition-all duration-300 scale-95 animate-modal-enter"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-border-color">
                    <h2 className="text-xl font-bold text-primary">{title}</h2>
                    <button onClick={onClose} className="text-text-dark hover:text-text-light transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-5">
                    {children}
                </div>
            </div>
            <style>{`
                @keyframes modal-enter {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-enter {
                    animation: modal-enter 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Modal;
