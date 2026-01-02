"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  PlayCircle, 
  Activity, 
  Globe, 
  Database, 
  Cpu, 
  Shield, 
  Zap,
  Layers,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BacktesterPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trades?type=backtest")
      .then((res) => res.json())
      .then((data) => {
        setTrades(data.trades || []);
        setLoading(false);
      });
  }, []);

  const totalPnL = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const winRate = trades.length > 0 ? ((trades.filter(t => t.pnl > 0).length / trades.length) * 100).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading Backtester...
      </div>
    );
  }

  return (
    <div className="space-y-12 text-white font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-sky-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 relative z-10 gap-8 pt-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Backtester Active</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-[0.02em] uppercase italic bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent leading-none">
            Backtest <span className="text-blue-500">History</span>
          </h1>
          <p className="text-white/80 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Your complete backtesting history and performance records. Review your strategies across historical data to see how they perform."
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <Link
            href="/backtester/new"
            className="group relative flex items-center gap-6 bg-blue-600/90 hover:bg-blue-500 text-white px-12 py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] transition-all shadow-3xl shadow-blue-500/20 active:scale-95 overflow-hidden border border-blue-400/20"
          >
            <Plus size={20} className="relative z-10" />
            <span className="relative z-10 font-bold">New Backtest</span>
          </Link>
        </div>
      </div>

      {/* Intelligence Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {[
          { 
            icon: totalPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />, 
            label: "Total P&L", 
            value: `$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 
            color: totalPnL >= 0 ? "emerald" : "red",
            sub: "Total Profit/Loss"
          },
          { 
            icon: <Activity size={20} />, 
            label: "Win Rate", 
            value: `${winRate}%`, 
            color: "blue",
            sub: "Win Rate Score"
          },
          { 
            icon: <Database size={20} />, 
            label: "Backtest Volume", 
            value: trades.length, 
            color: "purple",
            sub: "Total Trades"
          },
          { 
             icon: <Zap size={20} />, 
             label: "Avg Trade Performance", 
             value: `$${(totalPnL / (trades.length || 1)).toFixed(2)}`, 
             color: "amber",
             sub: "Avg Per Trade"
          },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D0D0D] border border-white/5 rounded-3xl p-8 group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`p-4 bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-2xl text-${stat.color}-400 group-hover:bg-${stat.color}-500 group-hover:text-black transition-all duration-500`}>
                   {stat.icon}
                </div>
                 <div className="flex flex-col items-end">
                   <span className={`text-4xl font-black italic tracking-tighter ${stat.color === "red" ? "text-red-400" : "text-white"}`}>{stat.value}</span>
                   <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-1">{stat.sub}</span>
                </div>
             </div>
              <div className="text-[11px] font-black text-white/80 uppercase tracking-[0.5em] italic border-t border-white/5 pt-6 group-hover:text-white transition-colors">
                 {stat.label}
              </div>
          </div>
        ))}
      </div>

      {/* Simulation Log Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden relative z-10 shadow-3xl group/ledger"
      >
        <div className="p-12 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/[0.02] to-transparent">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <Activity size={24} />
               </div>
                 <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-[0.5em] italic">Backtest History</h3>
                    <p className="text-[11px] text-white/60 uppercase font-black tracking-[0.3em] mt-2 flex items-center gap-2">
                       <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" /> History Loaded
                    </p>
                 </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-3 bg-white/[0.03] border border-white/5 px-8 py-4 rounded-2xl">
                  <Shield size={16} className="text-blue-500" />
                  <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.3em]">Verified</span>
               </div>
            </div>
        </div>
        
        {trades.length === 0 ? (
            <div className="py-56 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full animate-pulse" />
                <Layers size={80} className="text-white/10 mx-auto mb-12 relative z-10 animate-bounce" />
                 <h3 className="text-4xl font-black text-white/80 uppercase tracking-tighter italic relative z-10">No Records Found</h3>
                <p className="text-[12px] font-black text-white/60 uppercase tracking-[0.6em] italic max-w-sm mx-auto mt-6 leading-relaxed relative z-10">
                  No backtest data available. Start a new session to see your history.
                </p>
            </div>
        ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead>
                     <tr className="bg-white/[0.02] border-b border-white/5">
                       <th className="py-10 px-12 text-[11px] font-black text-white/80 uppercase tracking-[0.5em] italic">Date</th>
                      <th className="py-10 px-8 text-[11px] font-black text-white/80 uppercase tracking-[0.5em] italic">Symbol</th>
                      <th className="py-10 px-8 text-[11px] font-black text-white/80 uppercase tracking-[0.5em] italic">Direction</th>
                      <th className="py-10 px-8 text-[11px] font-black text-white/80 uppercase tracking-[0.5em] italic">Strategy</th>
                      <th className="py-10 px-12 text-[11px] font-black text-white/80 uppercase tracking-[0.5em] italic text-right">Result</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {trades.map((trade) => (
                        <tr key={trade._id} className="group/row hover:bg-white/[0.02] transition-all duration-500">
                             <td className="py-10 px-12">
                                <div className="flex items-center gap-6">
                                   <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 group-hover/row:bg-blue-500/10 group-hover/row:border-blue-500/30 transition-all duration-500">
                                      <Zap size={18} className="text-white/20 group-hover/row:text-blue-500" />
                                   </div>
                                     <div className="text-[13px] font-black text-white uppercase italic tracking-tighter tabular-nums group-hover/row:text-white transition-colors">
                                      {new Date(trade.createdAt).toLocaleDateString()}
                                      <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1">ID: {trade._id.slice(-4).toUpperCase()}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="py-10 px-8 font-black">
                                  <h4 className="text-2xl font-black text-white group-hover/row:text-blue-400 transition-all duration-500 uppercase italic tracking-tighter tabular-nums">{trade.symbol}</h4>
                                 <span className="text-[10px] text-white/60 uppercase tracking-widest block font-black">Symbol</span>
                             </td>
                             <td className="py-10 px-8">
                                <div className={`inline-flex px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${trade.direction === 'long' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover/row:bg-emerald-500 group-hover/row:text-black' : 'bg-red-500/5 border-red-500/20 text-red-400 group-hover/row:bg-red-500 group-hover/row:text-black'}`}>
                                   {trade.direction.toUpperCase()}
                                </div>
                             </td>
                             <td className="py-10 px-8">
                                  <div className="text-[11px] font-black text-white/80 uppercase tracking-[0.3em] italic">
                                   {trade.playbook || "Standard Strategy"}
                                </div>
                             </td>
                             <td className="py-10 px-12 text-right">
                                  <div className={`text-3xl font-black italic tracking-tighter tabular-nums transition-all duration-500 ${trade.pnl >= 0 ? "text-emerald-400 group-hover/row:scale-110" : "text-red-400 group-hover/row:opacity-100 opacity-90"}`}>
                                   {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                   <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1">Net P&L</div>
                                </div>
                             </td>
                        </tr>
                    ))}
                </tbody>
                </table>
             </div>
        )}
      </motion.div>
    </div>
  );
}
