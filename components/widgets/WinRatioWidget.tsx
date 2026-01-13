"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Target, TrendingUp, Zap, PieChart as PieIcon } from "lucide-react";

interface WinRatioWidgetProps {
  stats: any;
  className?: string;
}

export default function WinRatioWidget({
  stats,
  className = "",
}: WinRatioWidgetProps) {
  const wins = stats?.wins || 0;
  const losses = stats?.losses || 0;
  const total = wins + losses;
  const winRate = stats?.winRate || 0;

  const data = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];

  return (
    <div className={`h-full relative overflow-hidden group/winratio ${className}`}>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full pointer-events-none group-hover/winratio:bg-purple-500/10 transition-colors duration-700" />

      <div className="relative z-10 flex items-center justify-between mb-10 pb-8 border-b border-white/[0.03]">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-purple-500 animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Performance Vector</span>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tight uppercase leading-none">Win Ratio</h3>
        </div>
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-purple-400 shadow-2xl group-hover/winratio:scale-110 transition-transform duration-500">
          <PieIcon size={22} className="opacity-80" />
        </div>
      </div>

      <div className="relative h-[220px] w-full flex items-center justify-center">
        {total > 0 ? (
          <>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    startAngle={180}
                    endAngle={-180}
                  >
                    <Cell 
                      key={`cell-win`} 
                      fill="url(#winGradient)" 
                      className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    />
                    <Cell 
                      key={`cell-loss`} 
                      fill="rgba(255,255,255,0.03)" 
                    />
                  </Pie>
                  <defs>
                    <linearGradient id="winGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fff" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-black/90 border border-white/10 backdrop-blur-xl p-3 rounded-xl shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">
                              {payload[0].name}
                            </p>
                            <p className="text-sm font-black text-foreground italic">
                              {payload[0].value} Trades
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-black italic tabular-nums tracking-tighter leading-none"
              >
                {winRate}%
              </motion.span>
              <span className="text-[9px] text-foreground/30 uppercase tracking-[0.3em] font-black mt-2">
                Neural Accuracy
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <Target size={32} className="text-foreground/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">No Execution Data</span>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-8">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group/stat bg-white/[0.01] hover:bg-white/[0.03] rounded-[2rem] p-5 border border-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              <span className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] font-black">Winning</span>
            </div>
            <div className="text-3xl font-black text-foreground italic tabular-nums leading-none tracking-tighter group-hover/stat:translate-x-1 transition-transform">{wins}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group/stat bg-white/[0.01] hover:bg-white/[0.03] rounded-[2rem] p-5 border border-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
              <span className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] font-black">Losing</span>
            </div>
            <div className="text-3xl font-black text-foreground/60 italic tabular-nums leading-none tracking-tighter group-hover/stat:translate-x-1 transition-transform">{losses}</div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

