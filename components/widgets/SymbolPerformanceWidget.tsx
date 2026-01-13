"use client";

import React from "react";
import { TrendingUp, TrendingDown, Activity, Globe, Zap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface SymbolPerformanceWidgetProps {
  stats: any;
  className?: string;
}

export default function SymbolPerformanceWidget({
  stats,
  className = "",
}: SymbolPerformanceWidgetProps) {
  // Extract symbol performance from recent trades
  const symbolData = React.useMemo(() => {
    if (!stats?.recentTrades || stats.recentTrades.length === 0) {
      return [];
    }

    const symbolMap = new Map();

    stats.recentTrades.forEach((trade: any) => {
      const symbol = trade.symbol;
      if (!symbol) return;

      if (!symbolMap.has(symbol)) {
        symbolMap.set(symbol, {
          symbol,
          pnl: 0,
          trades: 0,
          wins: 0,
        });
      }

      const symbolStats = symbolMap.get(symbol);
      symbolStats.pnl += trade.pnl || 0;
      symbolStats.trades += 1;
      if ((trade.pnl || 0) > 0) {
        symbolStats.wins += 1;
      }
    });

    return Array.from(symbolMap.values())
      .map((symbol: any) => ({
        ...symbol,
        winRate: symbol.trades > 0 ? (symbol.wins / symbol.trades) * 100 : 0,
        avgPnl: symbol.trades > 0 ? symbol.pnl / symbol.trades : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5); // Top 5 symbols for better spacing
  }, [stats?.recentTrades]);

  return (
    <div className={`h-full relative overflow-hidden group/symbol ${className}`}>
      {/* Ambient background accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover/symbol:bg-primary/10 transition-colors duration-700" />
      
      <div className="relative z-10 flex items-center justify-between mb-8 pb-6 border-b border-white/[0.03]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Asset Intelligence</span>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tight uppercase leading-none">Symbol Edge</h3>
        </div>
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-primary shadow-2xl group-hover/symbol:rotate-[10deg] transition-transform duration-500">
          <BarChart3 size={22} className="opacity-80" />
        </div>
      </div>

      <div className="space-y-5">
        {symbolData.length > 0 ? (
          symbolData.map((symbol, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group/item"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-foreground group-hover/item:border-primary/30 transition-all duration-300">
                    <Globe size={16} className="text-foreground/60 group-hover/item:text-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-foreground tracking-tight uppercase italic leading-none mb-1">
                      {symbol.symbol}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
                        {symbol.trades} EXECUTION{symbol.trades !== 1 ? 'S' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xl font-black italic tracking-tighter leading-none mb-1 tabular-nums ${
                    symbol.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {symbol.pnl >= 0 ? "+" : ""}{symbol.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">AVG:</span>
                    <span className={`text-[10px] font-black tabular-nums ${symbol.avgPnl >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                      {symbol.avgPnl >= 0 ? "+" : ""}{symbol.avgPnl.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress/Win Rate section */}
              <div className="pl-[52px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap size={10} className={`${symbol.winRate >= 50 ? 'text-emerald-400/60' : 'text-red-400/60'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">
                      Dominance Rating
                    </span>
                  </div>
                  <span className={`text-[11px] font-black italic tabular-nums ${symbol.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {symbol.winRate.toFixed(1)}%
                  </span>
                </div>
                
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${symbol.winRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      symbol.winRate >= 50 
                        ? 'bg-gradient-to-r from-emerald-500/40 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' 
                        : 'bg-gradient-to-r from-red-500/40 to-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-3xl">
            <Activity size={32} className="text-foreground/10 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 text-center">
              No Data Streams Detected
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

