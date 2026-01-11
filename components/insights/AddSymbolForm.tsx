"use client";

import React, { useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SymbolSearch from '@/components/SymbolSearch';
import { ChevronDown } from 'lucide-react';

interface AddSymbolFormProps {
  onAdd: (symbol: string, type: string) => Promise<void>;
}

export function AddSymbolForm({ onAdd }: AddSymbolFormProps) {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('forex');
  const [loading, setLoading] = useState(false);

  // SymbolSearch handles the selection and asset type detection for us
  const handleSymbolSelect = (selectedSymbol: string, selectedAssetType: string) => {
    setSymbol(selectedSymbol);
    if (selectedAssetType) {
        setType(selectedAssetType);
    }
  };

  const handleManualAdd = async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      await onAdd(symbol, type);
      setSymbol('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 w-full max-w-2xl mx-auto bg-[#0A0A0A] p-4 rounded-[2rem] border border-white/5 shadow-2xl relative z-20 group">
       {/* Decorative corner lines */}
       <div className="absolute top-4 left-4 w-4 h-[1px] bg-white/10 group-focus-within:bg-primary/40 transition-colors" />
       <div className="absolute top-4 left-4 w-[1px] h-4 bg-white/10 group-focus-within:bg-primary/40 transition-colors" />
       <div className="absolute bottom-4 right-4 w-4 h-[1px] bg-white/10 group-focus-within:bg-primary/40 transition-colors" />
       <div className="absolute bottom-4 right-4 w-[1px] h-4 bg-white/10 group-focus-within:bg-primary/40 transition-colors" />

      <div className="flex-1">
        <SymbolSearch 
            value={symbol}
            assetType={type}
            onSymbolSelect={handleSymbolSelect}
            onAssetTypeChange={setType}
            placeholder="Data Ingestion: Search symbol (e.g. XAUUSD)..."
            className="w-full bg-transparent border-none focus:ring-0 placeholder:text-white/10 placeholder:italic placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em]"
        />
      </div>
      
      <div className="flex items-center">
          <Button 
            onClick={handleManualAdd}
            disabled={loading || !symbol}
            className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground hover:scale-105 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.2)] p-0 shrink-0"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={28} strokeWidth={3} />}
          </Button>
      </div>
    </div>
  );
}
