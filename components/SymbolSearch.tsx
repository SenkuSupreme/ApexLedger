"use client";

import { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Hash, Plus } from "lucide-react";
import {
  searchSymbols,
  getAssetTypeForSymbol,
  type SymbolData,
} from "@/lib/data/symbols";

interface SymbolSearchProps {
  value: string;
  assetType: string;
  onSymbolSelect: (symbol: string, assetType: string) => void;
  onAssetTypeChange: (assetType: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SymbolSearch({
  value,
  assetType,
  onSymbolSelect,
  onAssetTypeChange,
  placeholder = "Search symbols...",
  className = "",
}: SymbolSearchProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SymbolData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.length > 0) {
      const searchResults = searchSymbols(query, 8);
      setResults(searchResults);
      setSelectedIndex(-1);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value.toUpperCase();
    setQuery(newQuery);
    setIsOpen(true);

    // Auto-detect asset type if exact match
    const detectedAssetType = getAssetTypeForSymbol(newQuery);
    if (detectedAssetType && detectedAssetType !== assetType) {
      onAssetTypeChange(detectedAssetType);
    }
  };

  const handleSymbolSelect = (symbol: SymbolData) => {
    setQuery(symbol.symbol);
    setIsOpen(false);
    onSymbolSelect(symbol.symbol, symbol.assetType);
    onAssetTypeChange(symbol.assetType);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev: any) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev: any) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSymbolSelect(results[selectedIndex]);
        } else if (query.length > 0) {
          // If no selection but query exists, use query as a custom symbol
          onSymbolSelect(query, assetType);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getAssetTypeColor = (type: string) => {
    const colors = {
      forex: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      crypto: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      stocks: "text-green-400 bg-green-500/10 border-green-500/20",
      indices: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      cfd: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      futures: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    };
    return (
      colors[type as keyof typeof colors] ||
      "text-gray-400 bg-gray-500/10 border-gray-500/20"
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-sky-500/80 transition-colors"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl h-16 pl-12 pr-6 text-base font-medium text-white placeholder:text-white/40 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 outline-none transition-all"
        />
      </div>

      {isOpen && (results.length > 0 || (query.length > 0 && !results.find(r => r.symbol === query))) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 max-h-80 overflow-y-auto"
        >
          {results.map((symbol, index) => (
            <div
              key={symbol.symbol}
              onClick={() => handleSymbolSelect(symbol)}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-white/5 last:border-b-0 ${
                index === selectedIndex
                  ? "bg-sky-500/10 border-sky-500/20"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-white/60" />
                  <span className="font-bold text-white text-lg">
                    {symbol.symbol}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-white/80 font-medium">
                    {symbol.name}
                  </div>
                  <div className="text-xs text-white/60">
                    {symbol.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {symbol.exchange && (
                  <span className="text-xs text-white/60 font-mono">
                    {symbol.exchange}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getAssetTypeColor(
                    symbol.assetType
                  )}`}
                >
                  {symbol.assetType}
                </span>
              </div>
            </div>
          ))}
          
          {query.length > 0 && !results.find(r => r.symbol === query) && (
            <div
              onClick={() => {
                onSymbolSelect(query, assetType);
                setIsOpen(false);
              }}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors border-t border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                  <Plus size={18} className="text-sky-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Use "{query}" as custom symbol</div>
                  <div className="text-xs text-white/40">Not found in database - will use Twelve Data for pricing</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/40">
                Custom
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
