"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  LayoutGrid,
  TrendingUp,
  FileText,
  Activity,
  Globe,
  Plus,
  Microscope,
  Zap,
  Info,
  BarChart3,
  RefreshCw,
  Maximize2,
  X,
  ChevronRight
} from "lucide-react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    TradingView: any;
  }
}

const COMMON_TICKERS = [
  // Forex
  { symbol: "FX:EURUSD", name: "EUR / USD", category: "Forex" },
  { symbol: "FX:GBPUSD", name: "GBP / USD", category: "Forex" },
  { symbol: "FX:USDJPY", name: "USD / JPY", category: "Forex" },
  { symbol: "FX:AUDUSD", name: "AUD / USD", category: "Forex" },
  { symbol: "FX:USDCAD", name: "USD / CAD", category: "Forex" },
  { symbol: "FX:EURJPY", name: "EUR / JPY", category: "Forex" },
  // Gold & Commodities
  { symbol: "OANDA:XAUUSD", name: "Gold Spot", category: "Commodities" },
  { symbol: "OANDA:XAGUSD", name: "Silver Spot", category: "Commodities" },
  { symbol: "TVC:USOIL", name: "Crude Oil WTI", category: "Commodities" },
  { symbol: "TVC:UKOIL", name: "Brent Crude Oil", category: "Commodities" },
  { symbol: "TVC:GOLD", name: "Gold Futures", category: "Futures" },
  // Futures & Indices
  { symbol: "CME:ES1!", name: "E-mini S&P 500", category: "Futures" },
  { symbol: "CME:NQ1!", name: "E-mini Nasdaq 100", category: "Futures" },
  { symbol: "FOREXCOM:SPX500", name: "S&P 500 Index", category: "Indices" },
  { symbol: "FOREXCOM:NSXUSD", name: "Nasdaq 100", category: "Indices" },
  { symbol: "FOREXCOM:DJI", name: "Dow Jones 30", category: "Indices" },
  { symbol: "FOREXCOM:UK100", name: "FTSE 100", category: "Indices" },
  // Crypto
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin", category: "Crypto" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum", category: "Crypto" },
  { symbol: "BINANCE:SOLUSDT", name: "Solana", category: "Crypto" },
  { symbol: "BINANCE:XRPUSDT", name: "XRP", category: "Crypto" },
  { symbol: "BINANCE:ADAUSDT", name: "Cardano", category: "Crypto" },
  // Stocks
  { symbol: "NASDAQ:AAPL", name: "Apple Inc.", category: "Stocks" },
  { symbol: "NASDAQ:TSLA", name: "Tesla, Inc.", category: "Stocks" },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA Corp.", category: "Stocks" },
  { symbol: "NASDAQ:MSFT", name: "Microsoft Corp.", category: "Stocks" },
  { symbol: "NASDAQ:GOOGL", name: "Alphabet Inc.", category: "Stocks" },
  { symbol: "NASDAQ:META", name: "Meta Platforms", category: "Stocks" },
  { symbol: "NYSE:BRK.B", name: "Berkshire Hathaway", category: "Stocks" },
];

import { 
  TVSymbolInfoWidget, 
  TVCompanyProfileWidget, 
  TVFundamentalDataWidget, 
  TVTechnicalAnalysisWidget, 
  TVTimelineWidget,
  TVTickerTapeWidget
} from "@/components/widgets/TradingViewWidgets";

export default function ResearchPage() {
  const [symbol, setSymbol] = useState("OANDA:XAUUSD");
  const [searchInput, setSearchInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTickers = COMMON_TICKERS.filter(t => 
    t.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
    t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    t.category.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSelectSymbol = (newSym: string) => {
    setSymbol(newSym);
    setSearchInput("");
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      {/* GLOBAL TICKER TAPE */}
      <div className="h-[46px] border-b border-border bg-foreground/[0.02] flex-shrink-0 overflow-hidden">
        <TVTickerTapeWidget />
      </div>

      {/* SEARCH & HUD BAR */}
      <div className="flex items-center justify-between px-8 py-5 bg-card/30 backdrop-blur-md border-b border-border relative z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Microscope size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-[0.02em] uppercase italic text-foreground leading-none">Market Research</h1>
              <p className="text-[9px] text-foreground/60 font-mono uppercase tracking-widest mt-1">Institutional Intelligence Terminal</p>
            </div>
          </div>

          <div className="relative w-96" ref={dropdownRef}>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input  
              type="text" 
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search Symbol... (e.g. BTC, AAPL)"
              className="w-full bg-foreground/[0.03] border border-border rounded-2xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500/50 transition-all shadow-inner placeholder:text-muted-foreground/50 text-foreground"
            />
            {isDropdownOpen && searchInput.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {filteredTickers.length > 0 ? (
                    filteredTickers.map((t) => (
                      <button
                        key={t.symbol}
                        onClick={() => handleSelectSymbol(t.symbol)}
                        className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-all group border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3 text-left">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-black text-[10px] text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                              {t.symbol.split(":")[1]?.slice(0, 2)}
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-widest">{t.symbol}</p>
                             <p className="text-[9px] text-muted-foreground font-bold group-hover:text-foreground/80 transition-colors">{t.name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black uppercase py-1 px-2 rounded bg-foreground/[0.03] text-muted-foreground border border-border group-hover:border-blue-500/30 group-hover:text-blue-400">{t.category}</span>
                           <ChevronRight size={14} className="text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                       <Zap size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                       <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">No matching nodes found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2.5 bg-foreground/[0.03] border border-border rounded-xl">
              <Activity size={14} className="text-blue-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Live Nexus: {symbol}</span>
           </div>
        </div>

      </div>

      {/* TERMINAL VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none no-scrollbar bg-background relative">
        <div className="max-w-[1700px] mx-auto space-y-8 relative">
          
          {/* Background Mesh Overlay */}
          <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.03)_0%,transparent_50%)]" />

          {/* TOP ROW: SYMBOL INFO */}
          <section className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground/80 flex items-center gap-2 px-4">
                 <Activity size={16} className="text-blue-400" /> Symbol Metrics
               </h3>
               <div className="h-44 rounded-[2rem] overflow-hidden bg-card/30 border border-border transition-all">
                  <TVSymbolInfoWidget symbol={symbol} />
               </div>
          </section>

          {/* SECOND ROW: PROFILE & FUNDAMENTALS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
            <div className="flex flex-col h-full space-y-4 group">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground/80 flex items-center gap-2 px-4 group-hover:text-foreground transition-all font-bold">
                 <Info size={16} className="text-blue-400" /> Intelligence Profile
               </h3>
               <div className="flex-1 rounded-[2.5rem] bg-card/30 border border-border p-6 overflow-hidden hover:bg-card/50 transition-all group-hover:border-blue-500/20">
                  <TVCompanyProfileWidget symbol={symbol} />
               </div>
            </div>
            <div className="flex flex-col h-full space-y-4 group">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground/80 flex items-center gap-2 px-4 group-hover:text-foreground transition-all font-bold">
                 <BarChart3 size={16} className="text-blue-400" /> Fundamental Matrix
               </h3>
               <div className="flex-1 rounded-[2.5rem] bg-card/30 border border-border p-6 overflow-hidden hover:bg-card/50 transition-all group-hover:border-blue-500/20">
                  <TVFundamentalDataWidget symbol={symbol} />
               </div>
            </div>
          </div>

          {/* THIRD ROW: TECHNICAL & TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[600px] pb-12">
             <div className="lg:col-span-2 flex flex-col h-full space-y-4 group">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground/80 flex items-center gap-2 px-4 group-hover:text-foreground transition-all font-bold">
                   <Activity size={16} className="text-blue-400" /> Quantitative Sentiment
                </h3>
                <div className="flex-1 rounded-[2.5rem] bg-card/30 border border-border p-6 overflow-hidden hover:bg-card/50 transition-all group-hover:border-blue-500/20">
                   <TVTechnicalAnalysisWidget symbol={symbol} />
                </div>
             </div>
             <div className="lg:col-span-3 flex flex-col h-full space-y-4 group">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground/80 flex items-center gap-2 px-4 group-hover:text-foreground transition-all font-bold">
                   <Globe size={16} className="text-blue-400" /> Temporal Intelligence
                </h3>
                <div className="flex-1 rounded-[2.5rem] bg-card/30 border border-border p-6 overflow-hidden hover:bg-card/50 transition-all group-hover:border-blue-500/20">
                   <TVTimelineWidget symbol={symbol} />
                </div>
             </div>
          </div>

        </div>
      </main>

      <footer className="h-12 border-t border-border bg-black/80 backdrop-blur-md flex items-center justify-between px-8 text-[9px] font-black uppercase tracking-[0.4em] text-foreground/40">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span>Network Status: Cryptographically Secure</span>
           </div>
           <div className="h-2 w-px bg-border" />
           <span>Intelligence Stream: Active</span>
        </div>
        <div className="flex items-center gap-4 italic opacity-80 font-bold border-l border-border pl-8">
           CENTRAL DATA SOURCE: TRADINGVIEW DATA FEED
        </div>
      </footer>
    </div>
  );
}
