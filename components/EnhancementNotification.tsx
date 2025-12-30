"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  X,
  BarChart3,
  MousePointer,
  ExternalLink,
} from "lucide-react";

export default function EnhancementNotification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md">
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="text-green-400" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-2">
              Journal Enhanced! 🎉
            </h3>

            <div className="space-y-2 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <MousePointer size={12} className="text-blue-400" />
                <span>Drag & drop columns to reorder</span>
              </div>

              <div className="flex items-center gap-2">
                <ExternalLink size={12} className="text-purple-400" />
                <span>Click strategy names to view details</span>
              </div>

              <div className="flex items-center gap-2">
                <BarChart3 size={12} className="text-green-400" />
                <span>Enhanced trade view with charts</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-white/60">
              Portfolio names now show in the Account column
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X size={14} className="text-white/60" />
          </button>
        </div>
      </div>
    </div>
  );
}
