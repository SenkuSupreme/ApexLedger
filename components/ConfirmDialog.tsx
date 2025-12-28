'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200">
                    {/* Close Button */}
                    <Dialog.Close className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <X size={20} />
                    </Dialog.Close>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 ${
                        variant === 'danger' ? 'bg-rose-500/10' : 'bg-amber-500/10'
                    }`}>
                        <AlertTriangle 
                            size={32} 
                            className={variant === 'danger' ? 'text-rose-500' : 'text-amber-500'} 
                        />
                    </div>

                    {/* Content */}
                    <Dialog.Title className="text-2xl font-black text-white mb-3 tracking-tight">
                        {title}
                    </Dialog.Title>
                    <Dialog.Description className="text-white/60 text-sm leading-relaxed mb-8">
                        {description}
                    </Dialog.Description>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Dialog.Close className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                            {cancelText}
                        </Dialog.Close>
                        <button
                            onClick={handleConfirm}
                            className={`flex-1 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                variant === 'danger'
                                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                                    : 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
