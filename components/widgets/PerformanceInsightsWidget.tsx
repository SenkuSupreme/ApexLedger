"use client";

import React from "react";
import { TrendingUp, TrendingDown, Target, Zap, ShieldAlert, Activity, Award } from "lucide-react";
import { motion } from "framer-motion";

interface PerformanceInsightsWidgetProps {
  stats: any;
  className?: string;
}

export default function PerformanceInsightsWidget({
  stats,
  className = "",
}: PerformanceInsightsWidgetProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={`h-full relative overflow-hidden group/insights ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[70px] rounded-full pointer-events-none group-hover/insights:bg-emerald-500/10 transition-colors duration-700" />
      
      <div className="relative z-10 flex items-center justify-between mb-10 pb-8 border-b border-white/[0.03]">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Strategic Analysis</span>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tight uppercase leading-none">Performance Insights</h3>
        </div>
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-emerald-500 shadow-2xl group-hover/insights:scale-110 transition-transform duration-500">
          <Activity size={22} className="opacity-80" />
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Peak Session Card */}
        {stats?.bestDay && stats.bestDay.pnl !== -Infinity ? (
          <motion.div variants={item} className="relative group/card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent rounded-3xl border border-emerald-500/30 group-hover/card:border-emerald-500/50 transition-all duration-500" />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover/card:bg-emerald-500/20 transition-all duration-500" />
            
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Award size={14} className="text-emerald-400" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300 italic">Peak Execution Session</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-foreground/80 font-bold uppercase tracking-tight mb-1">
                    {new Date(stats.bestDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">
                      {stats.bestDay.count || 1} EXECUTIONS
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-emerald-400 tabular-nums italic tracking-tighter leading-none mb-1">
                    +${stats.bestDay.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Profit Secured</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-5 bg-white/[0.01] border border-dashed border-white/[0.1] rounded-3xl text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">No peak session data</span>
          </div>
        )}

        {/* Drawdown Session Card */}
        {stats?.worstDay && stats.worstDay.pnl !== Infinity ? (
          <motion.div variants={item} className="relative group/card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-rose-500/5 to-transparent rounded-3xl border border-rose-500/30 group-hover/card:border-rose-500/50 transition-all duration-500" />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl transition-all duration-500" />
            
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <ShieldAlert size={14} className="text-rose-400" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-300 italic">Critical Risk Event</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-foreground/80 font-bold uppercase tracking-tight mb-1">
                    {new Date(stats.worstDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[9px] font-black text-rose-400/80 uppercase tracking-widest">
                      {stats.worstDay.count || 1} EXECUTIONS
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-rose-400 tabular-nums italic tracking-tighter leading-none mb-1">
                    ${stats.worstDay.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500/60">Risk Exposure</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-5 bg-white/[0.01] border border-dashed border-white/[0.1] rounded-3xl text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">No drawdown session data</span>
          </div>
        )}

        {/* Intelligence Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Profit Factor", value: stats?.profitFactor?.toFixed(2) || "0.00", icon: <TrendingUp size={12} />, color: "emerald" },
            { label: "Expectancy", value: `$${stats?.expectancy?.toFixed(2) || "0.00"}`, icon: <Target size={12} />, color: "blue" },
            { label: "Average Win", value: `$${stats?.averageWin?.toFixed(0) || "0"}`, icon: <Zap size={12} />, color: "emerald" },
            { label: "Average Loss", value: `$${stats?.averageLoss?.toFixed(0) || "0"}`, icon: <TrendingDown size={12} />, color: "rose" },
          ].map((intel, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="relative p-4 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden group/intel"
            >
              <div className={`absolute top-0 right-0 w-12 h-12 rounded-full blur-xl -translate-y-6 translate-x-6 transition-all duration-500 
                ${intel.color === 'emerald' ? 'bg-emerald-500/10 group-hover/intel:bg-emerald-500/20' : 
                  intel.color === 'rose' ? 'bg-rose-500/10 group-hover/intel:bg-rose-500/20' : 
                  'bg-blue-500/10 group-hover/intel:bg-blue-500/20'}`} 
              />
              
              <div className="relative z-10">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-4 
                  ${intel.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 
                    intel.color === 'rose' ? 'bg-rose-500/10 text-rose-400' : 
                    'bg-blue-500/10 text-blue-400'}`}>
                  {intel.icon}
                </div>
                <p className="text-xl font-black text-foreground italic tabular-nums tracking-tighter mb-1 uppercase">
                  {intel.value}
                </p>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground/30">
                  {intel.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

