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
  Minus,
  Maximize2,
  Minimize2,
  Scale
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
  dailyBias?: string;
  timestampEntry: string;
  pnl?: number;
  outcome?: string;
  status: string; // 'Open' | 'Closed' | 'Pending'
}

interface BiasStats {
  count: number; // Total closed trades
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

interface AggregatedData {
  bullish: BiasStats;
  bearish: BiasStats;
  byPair: Record<string, { bullish: BiasStats; bearish: BiasStats }>;
}

const initialStats = (): BiasStats => ({
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

export default function BiasPage() {
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolios();
  const [data, setData] = useState<AggregatedData>({
    bullish: initialStats(),
    bearish: initialStats(),
    byPair: {},
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const updateStats = (stats: BiasStats, pnl: number) => {
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
        console.error("Error calculating P&L for bias stats:", trade._id, error);
      }
    }
    return Number(trade.pnl) || 0;
  };

  const fetchBiasData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "1000", // Fetch all trades for accurate stats
      });
      
      if (selectedPortfolioId && selectedPortfolioId !== "all") {
        params.append("portfolioId", selectedPortfolioId);
      }

      const res = await fetch(`/api/trades?${params}`);
      const { trades } = await res.json();

      const newData: AggregatedData = {
        bullish: initialStats(),
        bearish: initialStats(),
        byPair: {},
      };

      trades.forEach((trade: Trade) => {
        // Strict filtering: Only CLOSED trades count towards performance
        if (trade.status !== 'Closed') return;
        if (!trade.dailyBias) return;

        const bias = trade.dailyBias.toLowerCase();
        const isBullish = bias.includes("bull");
        const isBearish = bias.includes("bear");
        
        if (!isBullish && !isBearish) return;

        const pnl = getCalculatedPnL(trade);
        
        // Update Global Stats
        const targetGlobal = isBullish ? newData.bullish : newData.bearish;
        updateStats(targetGlobal, pnl);

        // Update Pair Stats
        if (!newData.byPair[trade.symbol]) {
          newData.byPair[trade.symbol] = { bullish: initialStats(), bearish: initialStats() };
        }
        updateStats(isBullish ? newData.byPair[trade.symbol].bullish : newData.byPair[trade.symbol].bearish, pnl);
      });

      setData(newData);
    } catch (error) {
      console.error("Failed to fetch bias data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiasData();
  }, [selectedPortfolioId]);

  const sortedPairs = Object.entries(data.byPair)
    .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
       const totalA = a[1].bullish.count + a[1].bearish.count;
       const totalB = b[1].bullish.count + b[1].bearish.count;
       return totalB - totalA;
    });

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Background Mesh (Preserved) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-sky-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-sky-400">Live Analytics</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-muted-foreground">
               <Brain size={10} className="text-sky-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Bias Performance</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Market Bias
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Deep-dive analysis of your directional bias. Metrics include expectancy, risk/reward ratios, and outlier analysis."
          </p>
        </div>
        
        <div className="flex items-center gap-4 relative z-0">
          <PortfolioSelector
            currentId={selectedPortfolioId}
            onSelect={setSelectedPortfolioId}
          />
        </div>
      </div>

      {/* Global Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-0">
        <PerformanceCard title="Bullish Performance" icon={<TrendingUp size={24} />} data={data.bullish} color="emerald" />
        <PerformanceCard title="Bearish Performance" icon={<TrendingDown size={24} />} data={data.bearish} color="rose" />
      </div>

      {/* Detailed Breakdown Section */}
      <div className="space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 bg-card/40 border border-border rounded-[2rem] px-6 py-4 backdrop-blur-md">
            <Globe size={18} className="text-muted-foreground" />
            <span className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground">Pair Breakdown</span>
          </div>

          <div className="relative group w-full md:w-96">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search Pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-card/40 border border-border rounded-[2rem] text-foreground placeholder:text-muted-foreground/30 text-[11px] font-black uppercase tracking-[0.3em] focus:border-primary/30 focus:outline-none transition-all backdrop-blur-md italic"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="py-20 text-center">
                  <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
               </div>
            ) : sortedPairs.length === 0 ? (
               <div className="py-20 text-center border border-dashed border-border rounded-[3rem] bg-card/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">No Data Found</p>
               </div>
            ) : (
               sortedPairs.map(([key, stats]) => (
                  <BreakdownRow key={key} title={key} stats={stats} />
               ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PerformanceCard({ title, icon, data, color }: { title: string; icon: React.ReactNode; data: BiasStats; color: "emerald" | "rose" }) {
  const isPositive = data.totalPnL >= 0;
  const pnlColor = isPositive ? "text-emerald-400" : "text-rose-400";
  const bgClass = color === "emerald" ? "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10" : "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10";
  const iconColor = color === "emerald" ? "text-emerald-400" : "text-rose-400";

  return (
    <div className={`${bgClass} backdrop-blur-xl border rounded-[3rem] p-10 transition-all duration-500 group relative overflow-hidden`}>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
       
       <div className="flex justify-between items-start mb-10 relative z-10">
          <div className="flex items-center gap-4">
             <div className={`p-4 rounded-2xl bg-background/40 border border-border shadow-inner ${iconColor}`}>
                {icon}
             </div>
             <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">{title}</h2>
                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mt-1">{data.count} Closed Trades</div>
             </div>
          </div>
          <div className="text-right">
             <span className={`text-4xl font-black italic tracking-tighter ${pnlColor}`}>${data.totalPnL.toFixed(2)}</span>
             <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] block mt-1">Net P&L</span>
          </div>
       </div>

       {/* Key Ratios */}
       <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="p-6 bg-background/40 rounded-[2rem] border border-border/50">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Win Rate</span>
               <ArrowUpRight size={12} className="text-muted-foreground/40" />
             </div>
             <span className={`text-3xl font-black italic tracking-tighter ${data.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{data.winRate}%</span>
         </div>
         <div className="p-6 bg-background/40 rounded-[2rem] border border-border/50">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Expectancy</span>
               <Scale size={12} className="text-muted-foreground/40" />
             </div>
             <span className={`text-3xl font-black italic tracking-tighter ${data.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${data.expectancy.toFixed(2)}</span>
         </div>
       </div>

       {/* Detailed Metrics */}
       <div className="grid grid-cols-3 gap-6 relative z-10 p-6 bg-background/20 rounded-[2rem] border border-border/50">
          <div>
             <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] block mb-2">Avg Win</span>
             <span className="text-xl font-black italic tracking-tighter text-emerald-400">${data.avgWin.toFixed(0)}</span>
          </div>
          <div>
             <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] block mb-2">Avg Loss</span>
             <span className="text-xl font-black italic tracking-tighter text-rose-400">${data.avgLoss.toFixed(0)}</span>
          </div>
          <div>
             <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] block mb-2">Profit Factor</span>
             <span className="text-xl font-black italic tracking-tighter text-foreground">{data.profitFactor}</span>
          </div>
          <div>
             <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] block mb-2">Max Win</span>
             <span className="text-xl font-black italic tracking-tighter text-emerald-400">${data.maxWin.toFixed(0)}</span>
          </div>
          <div>
             <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] block mb-2">Max Loss</span>
             <span className="text-xl font-black italic tracking-tighter text-rose-400">${data.maxLoss.toFixed(0)}</span>
          </div>
          <div>
              <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] block mb-2">Structure</span>
              <div className="flex items-center gap-1.5 opacity-60">
                <span className="text-[10px] font-bold text-emerald-400">{data.wins}W</span>
                <span className="text-[10px] font-bold text-muted-foreground">-</span>
                <span className="text-[10px] font-bold text-rose-400">{data.losses}L</span>
              </div>
          </div>
       </div>
    </div>
  );
}

function BreakdownRow({ title, stats }: { title: string; stats: { bullish: BiasStats; bearish: BiasStats } }) {
  const getPnLColor = (val: number) => val > 0 ? 'text-emerald-400' : val < 0 ? 'text-rose-400' : 'text-muted-foreground';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-6 hover:bg-card/60 transition-all duration-300 group"
    >
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-48 shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left">
           <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">{title}</h3>
           <span className="px-3 py-1 bg-foreground/5 rounded-full text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">
             {stats.bullish.count + stats.bearish.count} Closed Trades
           </span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
           {/* Bullish Stat Block */}
           <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-3xl p-5 hover:bg-emerald-500/[0.06] transition-colors relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">Bullish Bias</span>
                 </div>
                 <span className={`text-lg font-black italic tracking-tighter ${getPnLColor(stats.bullish.totalPnL)}`}>
                    ${stats.bullish.totalPnL.toFixed(0)}
                 </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-emerald-500/10 pt-4">
                 <div>
                    <div className="text-[8px] font-bold text-muted-foreground/40 mb-0.5">WIN RATE</div>
                    <div className="text-sm font-black italic text-emerald-400 tracking-tight">{stats.bullish.winRate}%</div>
                 </div>
                 <div>
                    <div className="text-[8px] font-bold text-muted-foreground/40 mb-0.5">AVG WIN</div>
                    <div className="text-sm font-black italic text-foreground tracking-tight">${stats.bullish.avgWin.toFixed(0)}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[8px] font-bold text-muted-foreground/40 mb-0.5">EXPECTANCY</div>
                    <div className="text-sm font-black italic text-foreground tracking-tight">${stats.bullish.expectancy.toFixed(0)}</div>
                 </div>
              </div>
           </div>

           {/* Bearish Stat Block */}
           <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-3xl p-5 hover:bg-rose-500/[0.06] transition-colors relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2">
                    <TrendingDown size={16} className="text-rose-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400/70">Bearish Bias</span>
                 </div>
                 <span className={`text-lg font-black italic tracking-tighter ${getPnLColor(stats.bearish.totalPnL)}`}>
                    ${stats.bearish.totalPnL.toFixed(0)}
                 </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-rose-500/10 pt-4">
                 <div>
                    <div className="text-[8px] font-bold text-muted-foreground/40 mb-0.5">WIN RATE</div>
                    <div className="text-sm font-black italic text-rose-400 tracking-tight">{stats.bearish.winRate}%</div>
                 </div>
                 <div>
                    <div className="text-[8px] font-bold text-muted-foreground/40 mb-0.5">AVG WIN</div>
                    <div className="text-sm font-black italic text-foreground tracking-tight">${stats.bearish.avgWin.toFixed(0)}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[8px] font-bold text-muted-foreground/40 mb-0.5">EXPECTANCY</div>
                    <div className="text-sm font-black italic text-foreground tracking-tight">${stats.bearish.expectancy.toFixed(0)}</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
