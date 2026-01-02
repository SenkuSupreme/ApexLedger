"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Maximize2,
  RefreshCw,
  Globe,
  Zap,
  Plus,
  X,
  PlusCircle,
  LayoutGrid
} from "lucide-react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function ChartPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("FX:EURUSD");
  const [watchlist, setWatchlist] = useState<{symbol: string, name: string}[]>([]);
  const [newSymbol, setNewSymbol] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("apex_watchlist");
    if (saved) {
      setWatchlist(JSON.parse(saved));
    } else {
      const initial = [
        { symbol: "FX:EURUSD", name: "EUR/USD" },
        { symbol: "FX:GBPUSD", name: "GBP/USD" },
        { symbol: "OANDA:XAUUSD", name: "Gold" },
        { symbol: "BITSTAMP:BTCUSD", name: "Bitcoin" },
      ];
      setWatchlist(initial);
      localStorage.setItem("apex_watchlist", JSON.stringify(initial));
    }
  }, []);

  const addToWatchlist = () => {
    if (!newSymbol.trim()) return;
    const symbol = newSymbol.toUpperCase();
    const formatted = symbol.includes(":") ? symbol : `FX:${symbol}`;
    const entry = { symbol: formatted, name: symbol };
    const updated = [...watchlist, entry];
    setWatchlist(updated);
    localStorage.setItem("apex_watchlist", JSON.stringify(updated));
    setNewSymbol("");
  };

  const removeFromWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const updated = watchlist.filter(s => s.symbol !== symbol);
    setWatchlist(updated);
    localStorage.setItem("apex_watchlist", JSON.stringify(updated));
    if (selectedSymbol === symbol && updated.length > 0) {
      setSelectedSymbol(updated[0].symbol);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      initializeChart();
      initializeCrossRates();
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.TradingView && containerRef.current) {
      initializeChart();
      initializeCrossRates();
    }
  }, [selectedSymbol]);

  const initializeCrossRates = () => {
    const container = document.getElementById("tv-cross-rates");
    if (!container) return;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "currencies": [
        "EUR",
        "USD",
        "JPY",
        "GBP",
        "CHF",
        "AUD",
        "CAD",
        "NZD"
      ],
      "isTransparent": true,
      "colorTheme": "dark",
      "locale": "en"
    });
    container.appendChild(script);
  };

  const initializeChart = () => {
    if (!window.TradingView || !containerRef.current) return;

    setIsLoading(true);
    containerRef.current.innerHTML = "";

    try {
      new window.TradingView.widget({
        autosize: true,
        symbol: selectedSymbol,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#050505",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: true,
        container_id: "tradingview_advanced_chart",
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: true,
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        studies: [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies",
          "MACD@tv-basicstudies",
        ],
        overrides: {
          "paneProperties.background": "#050505",
          "paneProperties.vertGridProperties.color": "#111111",
          "paneProperties.horzGridProperties.color": "#111111",
          "symbolWatermarkProperties.transparency": 90,
          "scalesProperties.textColor": "#888",
          "mainSeriesProperties.candleStyle.upColor": "#10b981",
          "mainSeriesProperties.candleStyle.downColor": "#ef4444",
        },
      });
      setIsLoading(false);
    } catch (error) {
      console.error("TradingView Initialization Failure:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative w-full max-w-[1700px] mx-auto overflow-y-auto scrollbar-none no-scrollbar pb-12">
      {/* INSTITUTIONAL CHART HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0A0A0A] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <LayoutGrid size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-[0.02em] bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
              Market Terminal
            </h1>
            <p className="text-[10px] text-white/80 font-black uppercase tracking-[0.3em] mt-1 italic">
              Live Market Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => initializeChart()}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-white/40 hover:text-white"
            title="Refresh Terminal"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-white/40 hover:text-white"
            title="Fullscreen Mode"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </header>

      {/* VERTICAL GRID STACK */}
      <div className="flex-1 flex flex-col bg-[#050505] space-y-12">
        {/* UPPER QUADRANT: ADVANCED CHART (FULL TERMINAL RESOLUTION) */}
        <main className="h-[85vh] min-h-[700px] relative overflow-hidden border-b border-white/5 shadow-2xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-30">
              <div className="flex flex-col items-center gap-4">
                <Zap className="text-blue-500 animate-pulse" size={32} />
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.5em]">Loading Market Data...</p>
              </div>
            </div>
          )}
          <div id="tradingview_advanced_chart" ref={containerRef} className="w-full h-full" />
        </main>

        {/* LOWER QUADRANT: CORRELATION MESH */}
        <section className="h-[600px] flex flex-col px-6">
          <div className="py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0 mb-6 font-bold group">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
               <h2 className="text-xs font-black text-white/60 uppercase tracking-[0.4em] group-hover:text-white transition-all">Currency Cross Rates</h2>
             </div>
             <Globe size={14} className="text-white/30 group-hover:text-blue-400 transition-all" />
          </div>
          <div className="flex-1 rounded-[2.5rem] bg-white/[0.02] border border-white/10 p-6 overflow-hidden hover:bg-white/[0.04] transition-all">
            <div id="tv-cross-rates" className="w-full h-full" />
          </div>
        </section>
      </div>

      {/* LOWER DATA BAND */}
      <footer className="flex items-center justify-between p-3 px-6 bg-black border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-white/50">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Connection: Active</span>
          </div>
          <div className="flex items-center gap-2 text-white/50">
            <Globe size={11} />
            <span>Symbol Index: {selectedSymbol}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/30 italic">
          ApexLedger v5.0.0
        </div>
      </footer>
    </div>
  );
}
