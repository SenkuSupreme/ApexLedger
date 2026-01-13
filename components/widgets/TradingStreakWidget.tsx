"use client";

import React from "react";
import { Flame, Target, TrendingUp, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface TradingStreakWidgetProps {
  stats: any;
  className?: string;
}

export default function TradingStreakWidget({
  stats,
  className = "",
}: TradingStreakWidgetProps) {
  const currentStreak = stats?.consistency?.currentStreak || 0;
  const currentStreakType = stats?.consistency?.currentStreakType || "neutral";
  
  const streakData = [
    {
      label: "Current Streak",
      value: currentStreak,
      type: currentStreakType,
      icon: <Flame size={18} />,
      color: currentStreakType === "win" ? "emerald" : currentStreakType === "loss" ? "red" : "orange",
      description: currentStreakType === "win" ? "Maintain the edge." : currentStreakType === "loss" ? "Reset your mental capital." : "Market is stabilizing."
    },
    {
      label: "Peak Performance",
      value: stats?.consistency?.bestWinStreak || 0,
      type: "win",
      icon: <TrendingUp size={18} />,
      color: "emerald",
      description: "Highest consecutive wins recorded."
    },
    {
      label: "Risk Exposure",
      value: stats?.consistency?.worstLossStreak || 0,
      type: "loss",
      icon: <Target size={18} />,
      color: "red",
      description: "Maximum drawdown sequence."
    },
  ];

  return (
    <div className={`h-full relative overflow-hidden group/widget ${className}`}>
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] rounded-full pointer-events-none group-hover/widget:bg-orange-500/10 transition-colors duration-700" />
      
      <div className="relative z-10 flex items-center justify-between mb-10 pb-8 border-b border-white/[0.03]">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-orange-500 animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Neural Momentum</span>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tight uppercase leading-none">Trading Streaks</h3>
        </div>
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-orange-500 shadow-2xl group-hover/widget:scale-110 transition-transform duration-500">
          <Zap size={22} className="fill-orange-500/20" />
        </div>
      </div>

      <div className="space-y-6">
        {streakData.map((streak, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-default"
          >
            <div className="flex items-start gap-4">
              <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-2xl border transition-all duration-500 flex items-center justify-center
                ${streak.color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/40' : 
                  streak.color === 'red' ? 'bg-red-500/5 border-red-500/20 text-red-400 group-hover:bg-red-500/10 group-hover:border-red-500/40' : 
                  'bg-orange-500/5 border-orange-500/20 text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/40'}
              `}>
                {streak.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/40">{streak.label}</span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border
                    ${streak.color === 'emerald' ? 'text-emerald-400/80 border-emerald-500/10 bg-emerald-500/5' : 
                      streak.color === 'red' ? 'text-red-400/80 border-red-500/10 bg-red-500/5' : 
                      'text-orange-400/80 border-orange-500/10 bg-orange-500/5'}
                  `}>
                    <Sparkles size={8} />
                    {streak.type === 'win' ? 'High' : streak.type === 'loss' ? 'Critical' : 'Stable'}
                  </div>
                </div>
                
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-black text-foreground italic leading-none tabular-nums tracking-tighter">
                    {streak.value}
                  </span>
                  <span className={`text-[11px] font-black uppercase tracking-wider mb-0.5 
                    ${streak.color === 'emerald' ? 'text-emerald-400/60' : streak.color === 'red' ? 'text-red-400/60' : 'text-orange-400/60'}`}>
                    {streak.type === "win" ? "Consecutive Wins" : streak.type === "loss" ? "Consecutive Losses" : "Current Session"}
                  </span>
                </div>

                {/* Progress Bar for Current Streak Heat */}
                {index === 0 && (
                  <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((streak.value / Math.max(stats?.consistency?.bestWinStreak || 1, stats?.consistency?.worstLossStreak || 1)) * 100, 100)}%` }}
                      className={`h-full rounded-full ${
                        streak.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500/40 to-emerald-400' : 
                        streak.color === 'red' ? 'bg-gradient-to-r from-red-500/40 to-red-400' : 
                        'bg-gradient-to-r from-orange-500/40 to-orange-400'
                      }`}
                    />
                  </div>
                )}
                
                <p className="mt-2 text-[10px] font-medium text-foreground/30 leading-relaxed italic group-hover:text-foreground/50 transition-colors">
                  "{streak.description}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

