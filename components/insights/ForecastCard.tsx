"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowRight, 
  Zap,
  BarChart2,
  AlertCircle,
  Loader2,
  Trash2,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Signal {
    label: string;
    status: 'VALID' | 'INVALID' | 'PENDING';
}

interface AnalysisResult {
    symbol: string;
    currentPrice: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    probability: number;
    signals: Signal[];
    concepts: {
      smc: string[];
      ict: string[];
      orb: string[];
      crt: string[];
    };
    analyzedAt: string;
}

interface ForecastCardProps {
  id: string; // Watchlist Item ID
  symbol: string;
  type: string;
  onRemove: (id: string) => void;
}

export function ForecastCard({ id, symbol, type, onRemove }: ForecastCardProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved analysis from DB on mount
  useEffect(() => {
      const loadSavedData = async () => {
          setLoading(true);
          try {
            const res = await fetch(`/api/insights/forecast?symbol=${symbol}`);
            if (res.ok) {
                const json = await res.json();
                if (json) setData(json);
            }
          } catch (e) {
             console.error("Failed to load saved forecast", e);
          } finally {
             setLoading(false);
          }
      };
      
      loadSavedData();
  }, [symbol]);

  // Trigger fresh analysis (Heavy Operation)
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalRes = await fetch(`/api/insights/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol })
      });
      
      if (!finalRes.ok) {
         if (finalRes.status === 503) throw new Error("Rate Limit or Data Error");
         throw new Error("Failed to fetch");
      }
      
      const json = await finalRes.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob > 70) return 'text-emerald-400';
    if (prob < 30) return 'text-rose-400';
    return 'text-amber-400';
  };

  const getTrendIcon = (trend: string) => {
      if (trend === 'BULLISH') return <TrendingUp className="text-emerald-400" size={24} />;
      if (trend === 'BEARISH') return <TrendingDown className="text-rose-400" size={24} />;
      return <Activity className="text-amber-400" size={24} />;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 hover:border-primary/30 transition-all duration-500 flex flex-col h-full overflow-hidden"
    >
        {/* Decorative corner lines */}
        <div className="absolute top-6 left-6 w-8 h-[1px] bg-white/10 group-hover:bg-primary/30 transition-colors" />
        <div className="absolute top-6 left-6 w-[1px] h-8 bg-white/10 group-hover:bg-primary/30 transition-colors" />
        <div className="absolute bottom-6 right-6 w-8 h-[1px] bg-white/10 group-hover:bg-primary/30 transition-colors" />
        <div className="absolute bottom-6 right-6 w-[1px] h-8 bg-white/10 group-hover:bg-primary/30 transition-colors" />

        <div className="relative z-10 flex flex-col h-full gap-4">
             {/* Header Section */}
             <div className="flex justify-between items-start relative z-10 mb-8">
                <div>
                    <h3 className="text-4xl font-black text-white italic uppercase tracking-[-0.04em] leading-none mb-2">{symbol}</h3>
                    <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">{type} Asset Class</span>
                    </div>
                </div>
                <div className="flex gap-2">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                             e.stopPropagation();
                            runAnalysis();
                        }}
                        disabled={loading}
                        className="h-10 w-10 rounded-xl bg-white/5 hover:bg-primary/20 text-white/20 hover:text-primary transition-all disabled:opacity-50"
                     >
                         <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                     </Button>
                     <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(id)}
                        className="h-10 w-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/20 hover:text-rose-400 transition-all"
                     >
                         <Trash2 size={16} />
                     </Button>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 min-h-[160px] relative">
                {loading ? (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <Loader2 className="animate-spin text-primary" size={48} strokeWidth={1} />
                            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                        </div>
                        <div className="space-y-2 text-center">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic block">Deploying Neural Grid</span>
                            <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em] font-mono">Status: Ingesting Price Action...</span>
                        </div>
                    </div>
                ) : data ? (
                    <div className="w-full space-y-10">
                        {/* High-Fidelity HUD Gauge Area */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-8 relative">
                            <div className="flex flex-col relative">
                                 <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic mb-3">Probability Matrix</span>
                                 <div className="flex items-baseline gap-2">
                                     <span className={`text-7xl font-black italic tracking-[-0.08em] leading-none ${getProbabilityColor(data.probability)}`}>
                                         {data.probability}%
                                     </span>
                                     <span className="text-[11px] font-black text-white/10 uppercase tracking-widest italic font-mono">CONFID.</span>
                                 </div>
                                 <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.probability}%` }}
                                        className={`h-full ${getProbabilityColor(data.probability).replace('text-', 'bg-')}`} 
                                     />
                                 </div>
                            </div>

                             <div className="text-right flex flex-col items-end">
                                 <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic mb-4 block">Core Bias State</span>
                                 <div className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase border-2 tracking-[0.4em] italic shadow-2xl ${
                                    data.trend === 'BULLISH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/10' : 
                                    data.trend === 'BEARISH' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/10' : 
                                    'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-amber-500/10'
                                 }`}>
                                     {data.trend}
                                 </div>
                                 <div className="mt-3 text-[9px] font-black text-white/10 uppercase tracking-[0.2em] font-mono italic">
                                     Signal Velocity: 0.84/s
                                 </div>
                             </div>
                        </div>
                        
                        {/* Technical Telemetry - Neural Signals */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic leading-none whitespace-nowrap">Neural Diagnostics</span>
                                <div className="h-[1px] flex-grow bg-white/5" />
                                <span className="text-[9px] font-black text-white/10 italic font-mono">[{data.signals.length} STREAMS]</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {data.signals.slice(0, 3).map((sig, i) => (
                                    <div key={i} className="group/sig flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                        <div className="flex items-center gap-4 truncate relative z-10">
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)] ${
                                                sig.status === 'VALID' ? 'bg-emerald-500' : 
                                                sig.status === 'INVALID' ? 'bg-rose-500' : 
                                                'bg-amber-500'
                                            }`} />
                                            <span className="text-[11px] font-bold text-white/60 uppercase tracking-tight truncate italic group-hover/sig:text-white transition-colors">
                                                {sig.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <span className={`text-[9px] font-black uppercase italic font-mono ${
                                                sig.status === 'VALID' ? 'text-emerald-500/60' : 
                                                sig.status === 'INVALID' ? 'text-rose-500/60' : 
                                                'text-amber-500/60'
                                            }`}>
                                                {sig.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {data.signals.length === 0 && (
                                <div className="p-8 rounded-[1.5rem] border border-dashed border-white/5 text-center bg-white/[0.01]">
                                    <span className="text-[10px] text-white/10 uppercase tracking-[0.5em] italic font-black">No active confluences detected</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-2 text-rose-400">
                        <AlertCircle size={24} />
                        <span className="text-xs font-bold text-center">{error}</span>
                        <Button variant="ghost" size="sm" onClick={runAnalysis} className="text-xs mt-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300">Retry</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Zap className="text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:text-indigo-300 transition-all" size={32} />
                        </div>
                        <span className="text-xs text-white/30 text-center max-w-[150px]">
                            Ready to analyze SMC, ICT & ORB patterns
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-auto relative z-10">
                {data ? (
                     <Link href={`/analytics/insights/${symbol}`} className="block w-full">
                        <Button className="w-full h-14 bg-primary text-primary-foreground font-black tracking-[0.2em] uppercase text-[11px] rounded-xl shadow-[0_0_30px_rgba(var(--primary),0.2)] hover:scale-[1.02] transition-all italic">
                            Report Gateway <ArrowRight size={16} className="ml-2" />
                        </Button>
                     </Link>
                ) : (
                     <Button 
                        onClick={runAnalysis} 
                        disabled={loading}
                        className="w-full h-14 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/5 font-black tracking-[0.2em] uppercase text-[11px] rounded-xl transition-all italic"
                     >
                        Initiate Scan <Zap size={14} className="ml-2 fill-current" />
                     </Button>
                )}
            </div>
        </div>
    </motion.div>
  );
}
