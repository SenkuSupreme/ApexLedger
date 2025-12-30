"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Settings,
  Maximize2,
  RefreshCw,
  Clock,
  Globe,
} from "lucide-react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function ChartPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("15");
  const [theme, setTheme] = useState("dark");

  const symbols = [
    { symbol: "EURUSD", name: "EUR/USD" },
    { symbol: "GBPUSD", name: "GBP/USD" },
    { symbol: "USDJPY", name: "USD/JPY" },
    { symbol: "AUDUSD", name: "AUD/USD" },
    { symbol: "USDCAD", name: "USD/CAD" },
    { symbol: "NZDUSD", name: "NZD/USD" },
    { symbol: "USDCHF", name: "USD/CHF" },
    { symbol: "XAUUSD", name: "Gold" },
    { symbol: "BTCUSD", name: "Bitcoin" },
  ];

  const timeframes = [
    { value: "1", label: "1m" },
    { value: "5", label: "5m" },
    { value: "15", label: "15m" },
    { value: "30", label: "30m" },
    { value: "60", label: "1H" },
    { value: "240", label: "4H" },
    { value: "D", label: "1D" },
    { value: "W", label: "1W" },
  ];

  useEffect(() => {
    // Load TradingView script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => initializeChart();
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (window.TradingView && containerRef.current) {
      initializeChart();
    }
  }, [selectedSymbol, selectedTimeframe, theme]);

  const initializeChart = () => {
    if (!window.TradingView || !containerRef.current) return;

    setIsLoading(true);

    // Clear existing chart
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    // Determine symbol format based on type
    let symbolFormat = selectedSymbol;
    if (selectedSymbol === "XAUUSD") {
      symbolFormat = "TVC:GOLD";
    } else if (selectedSymbol === "BTCUSD") {
      symbolFormat = "BITSTAMP:BTCUSD";
    } else {
      symbolFormat = `FX_IDC:${selectedSymbol}`;
    }

    try {
      new window.TradingView.widget({
        autosize: true,
        symbol: symbolFormat,
        interval: selectedTimeframe,
        timezone: "Etc/UTC",
        theme: theme === "dark" ? "dark" : "light",
        style: "1",
        locale: "en",
        toolbar_bg: theme === "dark" ? "#0A0A0A" : "#ffffff",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: "tradingview_chart",
        studies: [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies",
          "MACD@tv-basicstudies",
        ],
        overrides:
          theme === "dark"
            ? {
                "paneProperties.background": "#0A0A0A",
                "paneProperties.vertGridProperties.color": "#1a1a1a",
                "paneProperties.horzGridProperties.color": "#1a1a1a",
                "symbolWatermarkProperties.transparency": 90,
                "scalesProperties.textColor": "#AAA",
                "mainSeriesProperties.candleStyle.upColor": "#10b981",
                "mainSeriesProperties.candleStyle.downColor": "#ef4444",
                "mainSeriesProperties.candleStyle.drawWick": true,
                "mainSeriesProperties.candleStyle.drawBorder": true,
                "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
                "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
                "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
                "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
              }
            : {},
        onChartReady: () => {
          console.log("TradingView chart loaded successfully");
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Failed to initialize TradingView chart:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={24} className="text-white" />
            <h1 className="text-xl font-bold">Trading Charts</h1>
          </div>

          {/* Symbol Selector */}
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
          >
            {symbols.map((sym) => (
              <option key={sym.symbol} value={sym.symbol} className="bg-black">
                {sym.name}
              </option>
            ))}
          </select>

          {/* Timeframe Selector */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTimeframe === tf.value
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Toggle Theme"
          >
            <Settings size={16} />
          </button>

          {/* Refresh */}
          <button
            onClick={() => initializeChart()}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Refresh Chart"
          >
            <RefreshCw size={16} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white/60 text-sm">Loading chart...</p>
            </div>
          </div>
        )}

        <div
          id="tradingview_chart"
          ref={containerRef}
          className="w-full h-full"
        />
      </div>

      {/* Quick Info Bar */}
      <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border-t border-white/10 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-white/40" />
            <span className="text-white/60">
              NPT: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-white/40" />
            <span className="text-white/60">Market: {selectedSymbol}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/60">
          <span>Powered by TradingView</span>
        </div>
      </div>
    </div>
  );
}
