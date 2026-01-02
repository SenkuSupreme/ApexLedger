"use client";

import React, { useState, useEffect } from "react";
import { Layers, TrendingUp, Cpu, AlertCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { usePortfolios } from "@/context/PortfolioContext";
import PortfolioSelector from "@/components/PortfolioSelector";
import { calculateTradeMetrics } from "@/lib/utils/tradeCalculations";

interface Trade {
  _id: string;
  symbol: string;
  entryPrice?: number;
  exitPrice?: number;
  quantity?: number;
  fees?: number;
  assetType?: string;
  direction?: "long" | "short";
  strategyId?: any;
  strategy?: {
    name: string;
  };
  timestampEntry: string;
  pnl?: number;
  status: string;
}

interface StrategyStats {
  id: string;
  label: string;
  count: number;
  wins: number;
  losses: number;
  breakeven: number;
  totalPnL: number;
  grossProfit: number;
  grossLoss: number;
  winRate: number;
  profitFactor: number;
  avgPnL: number;
  avgWin: number;
  avgLoss: number;
  maxWin: number;
  maxLoss: number;
  expectancy: number;
}

const initialStrategyStats = (id: string, label: string): StrategyStats => ({
  id,
  label,
  count: 0,
  wins: 0,
  losses: 0,
  breakeven: 0,
  totalPnL: 0,
  grossProfit: 0,
  grossLoss: 0,
  winRate: 0,
  profitFactor: 0,
  avgPnL: 0,
  avgWin: 0,
  avgLoss: 0,
  maxWin: 0,
  maxLoss: 0,
  expectancy: 0,
});

function updateStats(stats: StrategyStats, pnl: number) {
  stats.count++;
  stats.totalPnL += pnl;
  if (pnl > 0) {
    stats.wins++;
    stats.grossProfit += pnl;
    stats.maxWin = Math.max(stats.maxWin, pnl);
  } else if (pnl < 0) {
    stats.losses++;
    stats.grossLoss += Math.abs(pnl);
    stats.maxLoss = Math.min(stats.maxLoss, pnl);
  } else {
    stats.breakeven++;
  }
  stats.winRate = stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0;
  stats.profitFactor = stats.grossLoss > 0 ? Number((stats.grossProfit / stats.grossLoss).toFixed(2)) : stats.grossProfit > 0 ? 100 : 0;
  stats.avgPnL = stats.count > 0 ? stats.totalPnL / stats.count : 0;
  stats.avgWin = stats.wins > 0 ? stats.grossProfit / stats.wins : 0;
  stats.avgLoss = stats.losses > 0 ? stats.grossLoss / stats.losses : 0;
  const winPct = stats.count > 0 ? stats.wins / stats.count : 0;
  const lossPct = stats.count > 0 ? stats.losses / stats.count : 0;
  stats.expectancy = (winPct * stats.avgWin) - (lossPct * stats.avgLoss);
}

function getCalculatedPnL(trade: Trade): number {
  if (trade.entryPrice && trade.exitPrice && trade.quantity) {
    try {
      const metrics = calculateTradeMetrics({
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        stopLoss: 0,
        takeProfit: 0,
        quantity: trade.quantity,
        direction: trade.direction || "long",
        portfolioBalance: 10000,
        fees: trade.fees || 0,
        assetType: trade.assetType || "forex",
        symbol: trade.symbol || "",
      });
      return metrics.netPnl;
    } catch (e) {
      console.error("Calc PnL error", e);
    }
  }
  return Number(trade.pnl) || 0;
}

export default function StrategyPerformancePage() {
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolios();
  const [strategyData, setStrategyData] = useState<Record<string, StrategyStats>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "1000" });
      if (selectedPortfolioId && selectedPortfolioId !== "all") {
        params.append("portfolioId", selectedPortfolioId);
      }
      const res = await fetch(`/api/trades?${params}`);
      const { trades } = await res.json();

      const stats: Record<string, StrategyStats> = {};

      trades.forEach((t: Trade) => {
        if (t.status !== "Closed") return;
        
        // Handle strategyId which might be populated or transformed by API
        let strategyName = "Unspecified";
        if (t.strategy && t.strategy.name) {
          strategyName = t.strategy.name;
        } else if (t.strategyId) {
          strategyName = typeof t.strategyId === 'object' ? (t.strategyId.name || "Unspecified") : t.strategyId;
        }

        if (!stats[strategyName]) {
          stats[strategyName] = initialStrategyStats(strategyName, strategyName);
        }
        const pnl = getCalculatedPnL(t);
        updateStats(stats[strategyName], pnl);
      });

      setStrategyData(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPortfolioId]);

  const strategyArray = Object.values(strategyData).sort((a, b) => b.totalPnL - a.totalPnL);

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-sky-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Shield size={20} className="text-emerald-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/60">Edge Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Strategy Performance
          </h1>
          <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Audit your trading systems. Identify which strategies provide sustainable alpha and which require refinement."
          </p>
        </div>
        <PortfolioSelector currentId={selectedPortfolioId} onSelect={setSelectedPortfolioId} />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
        {strategyArray.map((strategy, idx) => {
          const isPositive = strategy.totalPnL >= 0;
          const pnlColor = isPositive ? "text-emerald-400" : "text-rose-400";
          const bgColor = isPositive ? "bg-emerald-500/5" : "bg-rose-500/5";
          const borderColor = isPositive ? "border-emerald-500/10" : "border-rose-500/10";

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`${bgColor} ${borderColor} border rounded-[2.5rem] p-8 backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight line-clamp-1">{strategy.label}</h3>
                  <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">{strategy.count} Trades</span>
                </div>
                <Cpu size={20} className={isPositive ? "text-emerald-400/50" : "text-rose-400/50"} />
              </div>

              <div className="mb-6">
                <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest leading-none block mb-1">Total P&L</span>
                <div className={`text-4xl font-black italic ${pnlColor}`}>${strategy.totalPnL.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-background/40 rounded-2xl border border-border/50">
                  <span className="text-[8px] font-black uppercase text-muted-foreground/50 block mb-1">Win Rate</span>
                  <div className={`text-2xl font-black italic ${strategy.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{strategy.winRate}%</div>
                </div>
                <div className="p-3 bg-background/40 rounded-2xl border border-border/50">
                  <span className="text-[8px] font-black uppercase text-muted-foreground/50 block mb-1">Expectancy</span>
                  <div className={`text-2xl font-black italic ${strategy.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${strategy.expectancy.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-border/50 pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium italic">Profit Factor</span>
                  <span className="font-black">{strategy.profitFactor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium italic">Avg Win/Loss</span>
                  <div className="flex gap-2">
                    <span className="font-black text-emerald-400">${strategy.avgWin.toFixed(0)}</span>
                    <span className="text-muted-foreground/20 font-black">/</span>
                    <span className="font-black text-rose-400">${strategy.avgLoss.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {strategyArray.length === 0 && !loading && (
          <div className="col-span-full py-40 text-center bg-card/20 rounded-[3rem] border border-dashed border-border">
            <AlertCircle size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-muted-foreground/40 uppercase italic tracking-tighter">No Strategy Insights</h3>
            <p className="text-muted-foreground/20 text-[10px] font-black uppercase mt-2 tracking-[0.2em]">Start Journaling Trades to see Analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
