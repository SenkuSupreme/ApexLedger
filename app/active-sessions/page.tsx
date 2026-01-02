"use client";

import React, { useState, useEffect } from "react";
import { Clock, Sun, Moon, Sunrise, AlertCircle, Timer, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { usePortfolios } from "@/context/PortfolioContext";
import PortfolioSelector from "@/components/PortfolioSelector";
import { calculateTradeMetrics } from "@/lib/utils/tradeCalculations";
import { format, parseISO } from "date-fns";

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
  timestampExit?: string;
  pnl?: number;
  status: string;
}

interface ActiveSessionStats {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
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
  avgDuration: number; // in minutes
}

const initialActiveSessionStats = (id: string, label: string, icon: React.ReactNode, color: string): ActiveSessionStats => ({
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
  expectancy: 0,
  avgDuration: 0,
});

function updateActiveSessionStats(stats: ActiveSessionStats, pnl: number, durationMinutes: number) {
  stats.count++;
  stats.totalPnL += pnl;
  stats.avgDuration = ((stats.avgDuration * (stats.count - 1)) + durationMinutes) / stats.count;
  
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

function getTradeDuration(trade: Trade): number {
  if (!trade.timestampExit) return 0;
  try {
    const entry = new Date(trade.timestampEntry);
    const exit = new Date(trade.timestampExit);
    return Math.abs(exit.getTime() - entry.getTime()) / (1000 * 60); // minutes
  } catch {
    return 0;
  }
}

export default function ActiveSessionsPage() {
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolios();
  const [sessionData, setSessionData] = useState<Record<string, ActiveSessionStats>>({
    "Sydney": initialActiveSessionStats("Sydney", "Sydney Session", <Sun size={20} />, "blue"),
    "Tokyo": initialActiveSessionStats("Tokyo", "Tokyo Session", <Timer size={20} />, "indigo"),
    "London": initialActiveSessionStats("London", "London Session", <Sunrise size={20} />, "orange"),
    "New York": initialActiveSessionStats("New York", "New York Session", <Moon size={20} />, "emerald"),
    "London-NY Overlap": initialActiveSessionStats("London-NY Overlap", "London/NY Overlap", <Zap size={20} />, "purple"),
  });
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

      const newSessions: Record<string, ActiveSessionStats> = {
        "Sydney": initialActiveSessionStats("Sydney", "Sydney Session", <Sun size={20} />, "blue"),
        "Tokyo": initialActiveSessionStats("Tokyo", "Tokyo Session", <Timer size={20} />, "indigo"),
        "London": initialActiveSessionStats("London", "London Session", <Sunrise size={20} />, "orange"),
        "New York": initialActiveSessionStats("New York", "New York Session", <Moon size={20} />, "emerald"),
        "London-NY Overlap": initialActiveSessionStats("London-NY Overlap", "London/NY Overlap", <Zap size={20} />, "purple"),
      };

      trades.forEach((t: Trade) => {
        if (t.status !== "Closed") return;

        let tradeSessions = Array.isArray(t.sessions) ? t.sessions : (t.sessions ? [t.sessions] : []);
        
        // Auto-derive if missing
        if (tradeSessions.length === 0 && t.timestampEntry) {
          const dateObj = new Date(t.timestampEntry);
          const hour = dateObj.getHours();
          if (hour >= 22 || hour < 8) tradeSessions.push("Asia");
          else if (hour >= 8 && hour < 16) tradeSessions.push("London");
          else if (hour >= 13 && hour < 22) tradeSessions.push("New York");
        }

        const pnl = getCalculatedPnL(t);
        const duration = getTradeDuration(t);

        tradeSessions.forEach(s => {
          let key = s;
          if (s === "Sydney") key = "Sydney";
          else if (s === "Tokyo") key = "Tokyo";
          else if (s.includes("Asia")) key = "Tokyo";
          else if (s === "London") key = "London";
          else if (s === "New York") key = "New York";
          else if (s === "London-NY Overlap") key = "London-NY Overlap";
          
          if (newSessions[key]) {
            updateActiveSessionStats(newSessions[key], pnl, duration);
          }
        });
      });

      setSessionData(newSessions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPortfolioId]);

  const sessionArray = Object.values(sessionData);

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-orange-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Clock size={20} className="text-indigo-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/60">Time-Based Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Active Trading Sessions
          </h1>
          <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Analyze performance across market sessions with trade duration insights. Optimize your trading schedule for maximum efficiency."
          </p>
        </div>
        <PortfolioSelector currentId={selectedPortfolioId} onSelect={setSelectedPortfolioId} />
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {sessionArray.map((session, idx) => {
          const isPositive = session.totalPnL >= 0;
          const pnlColor = isPositive ? "text-emerald-400" : "text-rose-400";
          const borderColor = session.color === "indigo" ? "border-indigo-500/10" : 
                             session.color === "orange" ? "border-orange-500/10" : "border-emerald-500/10";
          const bgColor = session.color === "indigo" ? "bg-indigo-500/5" : 
                         session.color === "orange" ? "bg-orange-500/5" : "bg-emerald-500/5";

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`${bgColor} ${borderColor} border rounded-[2.5rem] p-8 backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">{session.label}</h3>
                  <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">{session.count} Trades</span>
                </div>
                <div className={`text-${session.color}-400`}>{session.icon}</div>
              </div>

              {/* Net P&L */}
              <div className="mb-6">
                <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Net P&L</span>
                <div className={`text-4xl font-black italic ${pnlColor}`}>${session.totalPnL.toFixed(2)}</div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-background/40 rounded-2xl border border-border/50">
                  <span className="text-[8px] font-black uppercase text-muted-foreground/50 block mb-1">Win Rate</span>
                  <div className={`text-2xl font-black italic ${session.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{session.winRate}%</div>
                </div>
                <div className="p-3 bg-background/40 rounded-2xl border border-border/50">
                  <span className="text-[8px] font-black uppercase text-muted-foreground/50 block mb-1">Avg Duration</span>
                  <div className="text-2xl font-black italic text-foreground">{Math.round(session.avgDuration)}m</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="space-y-2 text-xs border-t border-border/50 pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium">Expectancy</span>
                  <span className={`font-black ${session.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${session.expectancy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium">Profit Factor</span>
                  <span className="font-black">{session.profitFactor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium">Avg Win</span>
                  <span className="font-black text-emerald-400">${session.avgWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium">Avg Loss</span>
                  <span className="font-black text-rose-400">${session.avgLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium">Max Win</span>
                  <span className="font-black text-emerald-400">${session.maxWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60 font-medium">Max Loss</span>
                  <span className="font-black text-rose-400">${session.maxLoss.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
