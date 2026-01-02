"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Timer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Activity,
  Zap,
  Clock,
  Globe,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  sessions?: string[];
  timestampEntry: string;
  pnl?: number;
  outcome?: string;
  status: string; // 'Open' | 'Closed' | 'Pending'
}

interface SessionStats {
  id: string; // "Asia", "London", etc.
  label: string;
  icon: string;
  color: "indigo" | "orange" | "emerald" | "blue" | "purple";
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

const initialStats = (id: string, label: string, icon: string, color: any): SessionStats => ({
  id,
  label,
  icon,
  color,
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
  expectancy: 0
});

export default function SessionsPage() {
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolios();
  const [sessionsData, setSessionsData] = useState<Record<string, SessionStats>>({
    "Sydney": initialStats("Sydney", "Sydney Session", "🌏", "indigo"),
    "Tokyo": initialStats("Tokyo", "Tokyo Session", "🇯🇵", "purple"),
    "London": initialStats("London", "London Session", "🇬🇧", "orange"),
    "New York": initialStats("New York", "New York Session", "🇺🇸", "emerald"),
    "London-NY Overlap": initialStats("London-NY Overlap", "London/NY Overlap", "⚡", "blue"),
  });
  
  const [loading, setLoading] = useState(true);

  const updateStats = (stats: SessionStats, pnl: number) => {
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

    // Derived metrics
    stats.winRate = stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0;
    stats.profitFactor = stats.grossLoss > 0 ? Number((stats.grossProfit / stats.grossLoss).toFixed(2)) : stats.grossProfit > 0 ? 100 : 0;
    stats.avgPnL = stats.count > 0 ? stats.totalPnL / stats.count : 0;

    stats.avgWin = stats.wins > 0 ? stats.grossProfit / stats.wins : 0;
    stats.avgLoss = stats.losses > 0 ? stats.grossLoss / stats.losses : 0;

    // Expectancy
    const winPct = stats.count > 0 ? stats.wins / stats.count : 0;
    const lossPct = stats.count > 0 ? stats.losses / stats.count : 0;
    stats.expectancy = (winPct * stats.avgWin) - (lossPct * stats.avgLoss);
  };

  const getCalculatedPnL = (trade: Trade) => {
    // Replicate logic from TradeList to ensure consistency
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
      } catch (error) {
        console.error("Error calculating P&L for sessions stats:", trade._id, error);
      }
    }
    return Number(trade.pnl) || 0;
  };

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "1000",
      });
      if (selectedPortfolioId && selectedPortfolioId !== "all") {
        params.append("portfolioId", selectedPortfolioId);
      }

      const res = await fetch(`/api/trades?${params}`);
      const { trades } = await res.json();

      const newSessions: Record<string, SessionStats> = {
         "Sydney": initialStats("Sydney", "Sydney Session", "🌏", "indigo"),
         "Tokyo": initialStats("Tokyo", "Tokyo Session", "🇯🇵", "purple"),
         "London": initialStats("London", "London Session", "🇬🇧", "orange"),
         "New York": initialStats("New York", "New York Session", "🇺🇸", "emerald"),
         "London-NY Overlap": initialStats("London-NY Overlap", "London/NY Overlap", "⚡", "blue"),
      };

      trades.forEach((trade: Trade) => {
        // Strict filtering for CLOSED trades
        if (trade.status !== 'Closed') return;

        let tradeSessions = Array.isArray(trade.sessions) ? trade.sessions : (trade.sessions ? [trade.sessions] : []);
        
        // Auto-derive if missing (fallback logic)
        if (tradeSessions.length === 0 && trade.timestampEntry) {
           const dateObj = new Date(trade.timestampEntry);
           const hour = dateObj.getHours();
           // Simple heuristic
           if (hour >= 22 || hour < 8) tradeSessions.push("Sydney"); 
           else if (hour >= 8 && hour < 16) tradeSessions.push("London"); 
           else if (hour >= 13 && hour < 22) tradeSessions.push("New York"); 
        }

        const pnl = getCalculatedPnL(trade);

        tradeSessions.forEach(s => {
           // Normalize keys
           let key = s;
           if (s === "Sydney") key = "Sydney";
           else if (s === "Tokyo") key = "Tokyo";
           else if (s === "London") key = "London";
           else if (s === "New York") key = "New York";
           else if (s === "London-NY Overlap") key = "London-NY Overlap";
           else if (s.includes("Asia")) key = "Tokyo";
           
           if (newSessions[key]) {
              updateStats(newSessions[key], pnl);
           }
        });
      });

      setSessionsData(newSessions);
    } catch (error) {
      console.error("Failed to fetch session data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [selectedPortfolioId]);

  const sessionList = Object.values(sessionsData).sort((a,b) => b.totalPnL - a.totalPnL);

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Live Analytics</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-foreground/60">
               <Timer size={10} className="text-emerald-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Session Performance</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Market Sessions
          </h1>
          <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Deep session analysis. Includes volatility metrics, average return per session, and maximum drawdown risk."
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <PortfolioSelector
            currentId={selectedPortfolioId}
            onSelect={setSelectedPortfolioId}
          />
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="space-y-6 relative ">
        <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="py-20 text-center">
                  <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-6">
                 {sessionList.map((stats) => (
                    <SessionCard key={stats.id} stats={stats} />
                 ))}
               </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SessionCard({ stats }: { stats: SessionStats }) {
  const isPositive = stats.totalPnL >= 0;
  const pnlColor = isPositive ? "text-emerald-400" : "text-rose-400";
  
  // Dynamic border color based on session theme
  const borderClass = stats.color === 'indigo' ? 'border-indigo-500/20 bg-indigo-500/[0.02]' : 
                      stats.color === 'orange' ? 'border-orange-500/20 bg-orange-500/[0.02]' :
                      stats.color === 'emerald' ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-border';

  const iconBg = stats.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
                 stats.color === 'orange' ? 'bg-orange-500/10 text-orange-400' :
                 stats.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-foreground/5';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-xl border rounded-[3rem] p-8 transition-all duration-500 group relative overflow-hidden hover:bg-card/40 ${borderClass}`}
    >
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
       
       <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          {/* Identity */}
          <div className="w-full lg:w-64 shrink-0 flex items-center lg:block gap-4">
             <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center text-3xl shadow-inner mb-0 lg:mb-4`}>
                {stats.icon}
             </div>
             <div>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">{stats.label}</h2>
               <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mt-1">{stats.count} Closed Trades</div>
             </div>
          </div>

          {/* Key Metrics */}
          <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] block mb-2">Net P&L</span>
                 <span className={`text-2xl font-black italic tracking-tighter ${pnlColor}`}>${stats.totalPnL.toFixed(2)}</span>
              </div>
              <div>
                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] block mb-2">Win Rate</span>
                 <span className={`text-2xl font-black italic tracking-tighter ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{stats.winRate}%</span>
              </div>
              <div>
                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] block mb-2">Expectancy</span>
                 <span className={`text-2xl font-black italic tracking-tighter ${stats.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${stats.expectancy.toFixed(0)}</span>
              </div>
              <div>
                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] block mb-2">Avg Return</span>
                 <span className="text-2xl font-black italic tracking-tighter text-foreground">${stats.avgPnL.toFixed(0)}</span>
              </div>
          </div>
          
          {/* Advanced Stats */}
           <div className="w-full lg:w-48 shrink-0 flex flex-col justify-center gap-1 opacity-80 border-l border-border/20 pl-6">
             <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
               <span>Max Win</span>
               <span className="text-emerald-400">${stats.maxWin.toFixed(0)}</span>
             </div>
             <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
               <span>Max Loss</span>
               <span className="text-rose-400">${Math.abs(stats.maxLoss).toFixed(0)}</span>
             </div>
             <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
               <span>Avg Win</span>
               <span className="text-emerald-400">${stats.avgWin.toFixed(0)}</span>
             </div>
             <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
               <span>Avg Loss</span>
               <span className="text-rose-400">${stats.avgLoss.toFixed(0)}</span>
             </div>
          </div>
       </div>
    </motion.div>
  );
}
