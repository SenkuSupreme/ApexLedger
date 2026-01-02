"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, 200);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Institutional Backdrop */}
      <div
        className={`absolute inset-0 bg-background/80 backdrop-blur-xl transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Persistence Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Dialog Mesh */}
      <div
        className={`relative bg-card/90 border border-border rounded-[2.5rem] p-10 max-w-md w-full shadow-[0_50px_100px_rgba(0,0,0,0.5)] transform transition-all duration-300 overflow-hidden ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        {/* Modal Grain Effect */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="relative z-10">
          {/* Header Sector */}
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-border">
            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <AlertTriangle size={24} className="text-red-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500/60 font-mono">Critical Protocol</span>
              </div>
              <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">{title}</h3>
            </div>
          </div>

          {/* Operational Scope */}
          <p className="text-muted-foreground/40 text-xs font-medium italic mb-10 leading-relaxed px-2">
            "{message}"
          </p>

          {/* Action Ledger */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="px-8 py-5 bg-foreground/5 hover:bg-foreground/10 text-muted-foreground/40 hover:text-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] border border-border transition-all active:scale-95"
            >
              Abort
            </button>
            <button
              onClick={handleConfirm}
              className="px-8 py-5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(239,68,68,0.2)] transition-all active:scale-95 border border-red-400/20"
            >
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
