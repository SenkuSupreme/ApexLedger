"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Clock, Zap, Target, BarChart3, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface TimeAnalysisWidgetProps {
  stats: any;
  className?: string;
}

export default function TimeAnalysisWidget({
  stats,
  className = "",
}: TimeAnalysisWidgetProps) {
  const timeData = React.useMemo(() => {
    const trades = stats?.allTrades || stats?.recentTrades || [];
    if (trades.length === 0) return [];

    const hourMap = new Map();
    trades.forEach((trade: any) => {
      const timestamp = trade.timestampEntry || trade.createdAt;
      if (!timestamp) return;

      const date = new Date(timestamp);
      const hour = date.getHours();
      const hourLabel = hour === 0 ? "12AM" : hour < 12 ? `${hour}AM` : hour === 12 ? "12PM" : `${hour - 12}PM`;

      if (!hourMap.has(hourLabel)) {
        hourMap.set(hourLabel, {
          hour: hourLabel,
          hourValue: hour,
          pnl: 0,
          trades: 0,
        });
      }

      const hourStats = hourMap.get(hourLabel);
      hourStats.pnl += trade.pnl || 0;
      hourStats.trades += 1;
    });

    return Array.from(hourMap.values()).sort((a, b) => a.hourValue - b.hourValue);
  }, [stats?.allTrades, stats?.recentTrades]);

  const bestHour = timeData.reduce(
    (best, current) => (current.pnl > best.pnl ? current : best),
    { hour: "N/A", pnl: -Infinity }
  );

  const worstHour = timeData.reduce(
    (worst, current) => (current.pnl < worst.pnl ? current : worst),
    { hour: "N/A", pnl: Infinity }
  );

  return (
    <div className={`h-full relative overflow-hidden group/time ${className}`}>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full pointer-events-none group-hover/time:bg-primary/10 transition-colors duration-700" />

      <div className="relative z-10 flex items-center justify-between mb-10 pb-8 border-b border-white/[0.03]">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Temporal Logic</span>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tight uppercase leading-none">Time Analysis</h3>
        </div>
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-primary shadow-2xl group-hover/time:rotate-12 transition-transform duration-500">
          <Clock size={22} className="opacity-80" />
        </div>
      </div>

      <div className="h-56 relative group/chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              stroke="transparent"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }}
              interval={Math.ceil(timeData.length / 6)}
            />
            <YAxis
              stroke="transparent"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-black/90 border border-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl min-w-[140px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">{data.hour}</p>
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-[10px] font-black uppercase text-foreground/30">PnL</span>
                        <span className={`text-sm font-black italic tabular-nums ${data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black uppercase text-foreground/30">Executions</span>
                        <span className="text-sm font-black italic tabular-nums text-foreground">{data.trades}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 2, 2]}>
              {timeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "url(#winBarGradient)" : "url(#lossBarGradient)"}
                  className="transition-all duration-500 hover:opacity-80"
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="winBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="lossBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4">
        {[
          { label: "Optimal Hour", value: bestHour.hour, pnl: bestHour.pnl, icon: <Zap size={14} />, color: "emerald" },
          { label: "Critical Hour", value: worstHour.hour, pnl: worstHour.pnl, icon: <Target size={14} />, color: "rose" },
          { 
            label: "Total Flow", 
            value: timeData.reduce((sum, h) => sum + h.trades, 0).toString(), 
            sub: `${timeData.length} active slots`, 
            icon: <Activity size={14} />, 
            color: "blue" 
          }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white/[0.01] hover:bg-white/[0.03] rounded-[2rem] border border-white/[0.03] hover:border-white/[0.08] transition-all duration-300 group/tile"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 scale-90 group-hover/tile:scale-100 transition-transform
              ${item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 
                item.color === 'rose' ? 'bg-rose-500/10 text-rose-400' : 
                'bg-blue-500/10 text-blue-400'}`}
            >
              {item.icon}
            </div>
            <div className="text-xl font-black text-foreground italic tabular-nums leading-none tracking-tighter mb-1 uppercase">
              {item.value === "N/A" ? "--" : item.value}
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
              {item.label}
            </p>
            {item.pnl !== undefined && (
               <p className={`text-[10px] font-black italic mt-1 tabular-nums ${item.pnl >= 0 ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                {item.pnl > -Infinity && item.pnl < Infinity ? `${item.pnl >= 0 ? '+' : ''}$${item.pnl.toFixed(0)}` : '--'}
              </p>
            )}
            {item.sub && (
              <p className="text-[10px] font-black italic mt-1 text-foreground/20 uppercase tracking-widest">
                {item.sub}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

