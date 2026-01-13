"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Activity, Crosshair } from "lucide-react";

interface TradeChartsProps {
  trade: any;
  calculatedMetrics?: any;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Activity size={10} className="text-sky-500" />
          Terminal Data Stream {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-tight">
                {entry.name}
              </span>
              <span className="text-sm font-black italic text-white" style={{ color: entry.color }}>
                {typeof entry.value === "number" ? entry.value.toFixed(5) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function TradeCharts({
  trade,
  calculatedMetrics,
}: TradeChartsProps) {
  const priceMovementData = useMemo(() => {
    if (!trade.entryPrice) return [];

    const entry = trade.entryPrice;
    const exit = trade.exitPrice || entry;
    const stopLoss = trade.stopLoss;
    const takeProfit = trade.takeProfit;

    const data = [];
    const steps = 40; // Increased steps for smoother curve

    const seed = trade._id ? parseInt(trade._id.slice(-8), 16) : 12345;
    let random = seed;

    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    let currentPrice = entry;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      if (trade.exitPrice) {
        // Brownian motion towards exit
        const noise = (seededRandom() - 0.5) * 0.001 * entry;
        const trend = (exit - entry) / steps;
        currentPrice = entry + (exit - entry) * progress + (seededRandom() - 0.5) * 0.002 * entry;
      } else {
        // Open trade volatility
        currentPrice = currentPrice + (seededRandom() - 0.5) * 0.0005 * entry;
      }

      data.push({
        time: i,
        price: currentPrice,
        entry: entry,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
      });
    }

    return data;
  }, [
    trade.entryPrice,
    trade.exitPrice,
    trade.stopLoss,
    trade.takeProfit,
    trade._id,
  ]);

  const minPrice = Math.min(...priceMovementData.map((d: any) => Math.min(d.price, d.stopLoss || d.price, d.takeProfit || d.price)));
  const maxPrice = Math.max(...priceMovementData.map((d: any) => Math.max(d.price, d.stopLoss || d.price, d.takeProfit || d.price)));
  const padding = (maxPrice - minPrice) * 0.2;

  return (
    <div className="space-y-8">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-sky-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
        
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-full">
                  <div className="w-1 h-1 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-sky-400 italic">Temporal Flow</span>
               </div>
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Stream: Price Action</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              Price <span className="text-sky-500/40 font-thin not-italic">Movement</span> Analysis
            </h3>
          </div>
          
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col items-end">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Volatility Index</span>
                <span className="text-xs font-black italic text-sky-400 tracking-tighter">HIGH_SIGNAL</span>
             </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceMovementData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#ffffff"
                opacity={0.03}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                hide
              />
              <YAxis
                stroke="#ffffff"
                opacity={0.1}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[minPrice - padding, maxPrice + padding]}
                tickFormatter={(val) => val.toFixed(4)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff22', strokeWidth: 1 }} />
              
              {/* SL / TP Zones */}
              {trade.takeProfit && (
                <ReferenceLine y={trade.takeProfit} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} label={{ position: 'right', value: 'TP', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
              )}
              {trade.stopLoss && (
                <ReferenceLine y={trade.stopLoss} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} label={{ position: 'right', value: 'SL', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
              )}
              <ReferenceLine y={trade.entryPrice} stroke="#ffffff" opacity={0.1} strokeDasharray="5 5" label={{ position: 'left', value: 'ENTRY', fill: '#ffffff44', fontSize: 10 }} />

              <Area
                type="monotone"
                dataKey="price"
                stroke="#0ea5e9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPrice)"
                name="Market Price"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 flex justify-between items-center px-2">
           <div className="flex gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Market Feed</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Target Objective</span>
              </div>
           </div>
           <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] font-mono">Terminal v2.4</span>
        </div>
      </div>

      {/* Trade Summary Statistics */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Trade Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Duration
            </div>
            <div className="text-lg font-bold text-white">
              {trade.timestampExit
                ? `${Math.round(
                    (new Date(trade.timestampExit).getTime() -
                      new Date(trade.timestampEntry).getTime()) /
                      (1000 * 60 * 60)
                  )}h`
                : "Open"}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Position Size
            </div>
            <div className="text-lg font-bold text-white">
              ${((trade.entryPrice || 0) * (trade.quantity || 0)).toFixed(2)}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Max Risk
            </div>
            <div className="text-lg font-bold text-red-400">
              $
              {(calculatedMetrics?.riskAmount || trade.riskAmount || 0).toFixed(
                2
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Fees Paid
            </div>
            <div className="text-lg font-bold text-orange-400">
              ${(trade.fees || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
