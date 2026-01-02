"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

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
      .map((symbol) => ({
        ...symbol,
        winRate: symbol.trades > 0 ? (symbol.wins / symbol.trades) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 6); // Top 6 symbols
  }, [stats?.recentTrades]);

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Symbol Performance</h3>
          <p className="text-xs text-foreground/80 dark:text-muted-foreground font-mono uppercase tracking-widest">
            Top Pairs
          </p>
        </div>
        <TrendingUp size={20} className="text-foreground/80 dark:text-muted-foreground" />
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {symbolData.length > 0 ? (
          symbolData.map((symbol, index) => (
            <div
              key={index}
              className="p-3 bg-foreground/5 border border-border rounded-lg hover:bg-foreground/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {symbol.symbol}
                  </span>
                  {symbol.pnl >= 0 ? (
                    <TrendingUp size={14} className="text-green-400" />
                  ) : (
                    <TrendingDown size={14} className="text-red-400" />
                  )}
                </div>
                <div
                  className={`text-sm font-bold ${
                    symbol.pnl >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {symbol.pnl >= 0 ? "+" : ""}${symbol.pnl.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-between text-xs text-foreground/80 dark:text-muted-foreground">
                <span>{symbol.trades} trades</span>
                <span>{symbol.winRate.toFixed(1)}% win rate</span>
              </div>

              {/* Win rate bar */}
              <div className="mt-2 w-full bg-foreground/10 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    symbol.winRate >= 50 ? "bg-green-400" : "bg-red-400"
                  }`}
                  style={{ width: `${symbol.winRate}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-foreground/60 dark:text-muted-foreground text-sm py-8">
            No symbol data available
          </div>
        )}
      </div>
    </div>
  );
}
