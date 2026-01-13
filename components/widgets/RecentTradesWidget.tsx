"use client";

import React from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RecentTradesWidgetProps {
  stats: any;
  className?: string;
}

export default function RecentTradesWidget({
  stats,
  className = "",
}: RecentTradesWidgetProps) {
  const recentTrades = stats?.recentTrades || [];

  return (
    <div className={`h-full relative overflow-hidden group/recent ${className}`}>
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none group-hover/recent:bg-blue-500/10 transition-colors duration-700" />

      <div className="relative z-10 flex items-center justify-between mb-10 pb-8 border-b border-white/[0.03]">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-500 animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Activity Stream</span>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tight uppercase leading-none">Recent Trades</h3>
        </div>
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-blue-400 shadow-2xl group-hover/recent:rotate-12 transition-transform duration-500">
          <Activity size={22} className="opacity-80" />
        </div>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {recentTrades.length > 0 ? (
            recentTrades.map((trade: any, index: number) => (
              <motion.div
                key={trade._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group/item relative flex items-center justify-between p-5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/[0.1] rounded-[2rem] transition-all duration-300 cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500
                    ${trade.direction?.toLowerCase() === 'long' 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover/item:bg-emerald-500/10' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-400 group-hover/item:bg-rose-500/10'}
                  `}>
                    {trade.direction?.toLowerCase() === 'long' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  
                  <div>
                    <div className="text-lg font-black text-foreground uppercase tracking-tight italic leading-none mb-1">
                      {trade.symbol || "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">
                        {new Date(trade.timestampEntry || trade.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-foreground/10" />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${trade.pnl >= 0 ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                        {trade.direction || "Long"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-black italic tracking-tighter leading-none mb-1 tabular-nums ${
                    trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {trade.pnl >= 0 ? "+" : ""}{trade.pnl?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <Zap size={10} className="text-foreground/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 tabular-nums">
                      {trade.rMultiple ? trade.rMultiple.toFixed(2) : "0.00"}R
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-[2.5rem]">
              <Activity size={32} className="text-foreground/10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 text-center">
                Quiet Session / No Trades
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

