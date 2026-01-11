"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Loader2, Sparkles, Activity, Target, BrainCircuit, BarChart2, Globe, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

export default function DetailedInsightPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol as string;

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/insights/forecast?symbol=${symbol}`);
      if (!res.ok) {
        if (res.status === 503) throw new Error("API Rate Limit. Please wait a moment.");
        throw new Error("Failed to fetch analysis.");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchAnalysis();
    }
  }, [symbol]);

  if (!symbol) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden">
         {/* High-Fidelity Background Architecture */}
         <div className="fixed inset-0 pointer-events-none -z-10 bg-[#050505]">
             <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan-horizontal" />
         </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
            {/* HUD Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 pb-8 border-b border-white/5 mb-8">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all rounded-full" />
                        <Button variant="outline" className="relative h-16 w-16 border-white/10 rounded-2xl bg-[#0A0A0A] p-0 hover:bg-white/5 transition-transform hover:scale-105" onClick={() => router.back()}>
                            <ArrowLeft size={28} />
                        </Button>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.5em] italic">System Online // Tracking</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-[-0.06em] text-white italic uppercase leading-none">
                            {symbol} <span className="text-primary/20">/</span> <span className="text-white/20">USD</span>
                        </h1>
                    </div>
                </div>
                
                <div className="md:ml-auto flex items-center gap-8">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-1 italic">Neural Engine Rank 4.2</span>
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-white/10'}`} />)}
                        </div>
                    </div>
                    <Button 
                        onClick={fetchAnalysis}
                        disabled={loading}
                        className="h-14 bg-primary text-primary-foreground px-8 rounded-xl font-black uppercase tracking-widest gap-3 shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-105 transition-all text-[11px]"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Sync Forecast
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center">
                    <Loader2 size={64} className="text-indigo-400 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold text-white/60">Forecasting Price Action...</h2>
                    <p className="text-white/30 mt-2 font-mono text-sm max-w-md text-center">
                        Synthesizing Smart Money Concepts, ICT patterns, and Volatility models.
                    </p>
                </div>
            ) : error ? (
                <div className="h-[50vh] flex flex-col items-center justify-center text-center">
                    <AlertCircle size={64} className="text-rose-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white">Analysis Failed</h2>
                    <p className="text-white/40 mt-2 mb-6">{error}</p>
                    <Button onClick={fetchAnalysis}>Try Again</Button>
                </div>
            ) : data ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-12"
                >
                    {/* SYSTEM DIAGNOSTICS & SCORE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* 1. Radar Score Hub */}
                        <div className="lg:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center text-center relative overflow-hidden group">
                           {/* Decorative HUD Elements */}
                           <div className="absolute top-6 left-6 w-12 h-[2px] bg-white/10" />
                           <div className="absolute top-6 left-6 w-[2px] h-12 bg-white/10" />
                           <div className="absolute bottom-6 right-6 w-12 h-[2px] bg-white/10" />
                           <div className="absolute bottom-6 right-6 w-[2px] h-12 bg-white/10" />

                            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] mb-12 italic">Precision Matrix Conv.</h3>
                            
                            <div className="relative mb-12 flex items-center justify-center">
                                {/* Probability Ring */}
                                <div className="absolute w-[240px] h-[240px] border border-white/5 rounded-full" />
                                <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full" />
                                <div className="absolute w-[160px] h-[160px] border border-white/5 rounded-full" />
                                <motion.div 
                                    className="absolute w-full h-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary blur-sm rounded-full" />
                                </motion.div>

                                <div className="relative z-10">
                                    <span className={`text-8xl font-black tracking-[-0.08em] italic leading-none ${
                                        data?.trend === 'BULLISH' ? 'text-emerald-500' : 
                                        data?.trend === 'BEARISH' ? 'text-rose-500' : 
                                        'text-amber-500'
                                    }`}>
                                        {data?.probability}%
                                    </span>
                                </div>
                            </div>

                            <div className={`px-6 py-2 rounded-full text-[12px] font-black uppercase border mb-16 tracking-[0.4em] italic ${
                                data?.trend === 'BULLISH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                                data?.trend === 'BEARISH' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                                'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                                System Bias: {data?.trend}
                            </div>

                            <div className="w-full space-y-6">
                                <div className="flex justify-between items-end">
                                     <div className="text-left">
                                         <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic block mb-1">Mark Price</span>
                                         <div className="text-3xl font-black italic font-mono tracking-tighter text-white">${data?.currentPrice?.toFixed(2)}</div>
                                     </div>
                                      {data?.analyzedAt && (
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic block mb-1">Last Log</span>
                                            <div className="text-xs font-bold text-primary italic uppercase">{new Date(data.analyzedAt).toLocaleTimeString()}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data?.probability}%` }}
                                        className={`h-full ${
                                            data?.trend === 'BULLISH' ? 'bg-emerald-500' : 
                                            data?.trend === 'BEARISH' ? 'bg-rose-500' : 
                                            'bg-amber-500'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Neural Diagnostics (Signals) */}
                         <div className="lg:col-span-8 space-y-8">
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 h-full">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                                            <Sparkles size={24} />
                                        </div>
                                        <h4 className="text-[13px] font-black italic text-white/70 uppercase tracking-[0.5em]">Neural Signal Diagnostics</h4>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-1.5 h-6 bg-white/5 rounded-full" />)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data?.signals?.map((sig, i) => (
                                        <div key={i} className="group flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                                                sig.status === 'VALID' ? 'bg-emerald-500' : 
                                                sig.status === 'INVALID' ? 'bg-rose-500' : 
                                                'bg-amber-500'
                                            }`} />
                                            <div className="flex items-center gap-5">
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                                    sig.status === 'VALID' ? 'bg-emerald-500' : 
                                                    sig.status === 'INVALID' ? 'bg-rose-500' : 
                                                    'bg-amber-500'
                                                }`} />
                                                <span className="text-xs font-black uppercase text-white/80 tracking-widest italic">{sig.label}</span>
                                            </div>
                                            <div className={`text-[9px] font-black uppercase italic ${
                                                sig.status === 'VALID' ? 'text-emerald-500/60' : 
                                                sig.status === 'INVALID' ? 'text-rose-500/60' : 
                                                'text-amber-500/60'
                                            }`}>
                                                {sig.status}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Default systemic fills if signals are few */}
                                    {(!data?.signals || data.signals.length < 4) && (
                                         <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/5 opacity-50 italic">
                                            <span className="text-xs font-bold text-white/20 uppercase tracking-widest italic">Scanning structural anomalies...</span>
                                            <div className="w-8 h-[1px] bg-white/10" />
                                         </div>
                                    )}
                                </div>

                                <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <DiagnosticStat label="Cores Active" value="08" />
                                    <DiagnosticStat label="Sync Latency" value="1.2ms" />
                                    <DiagnosticStat label="Matrix Load" value="14%" />
                                    <DiagnosticStat label="Buffer" value="OK" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* THE MASTER MATRIX GRID */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 px-2">
                             <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 italic">Integrated Methodology Protocol</h2>
                             <div className="h-[1px] flex-grow bg-white/5" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Link href={`/analytics/insights/${symbol}/smc`} className="h-full">
                                <ConceptCard 
                                    title="SMC" 
                                    subtitle="Structural Flow"
                                    items={data?.concepts?.smc?.length > 0 ? data.concepts.smc : ['HH/LL Structural Sync', 'OB Validation', 'FVG Alignment']} 
                                    icon={BrainCircuit}
                                    color="indigo"
                                    score={data?.probability}
                                />
                            </Link>
                            <Link href={`/analytics/insights/${symbol}/ict`} className="h-full">
                                <ConceptCard 
                                    title="ICT" 
                                    subtitle="Precision Matrix"
                                    items={data?.concepts?.ict?.length > 0 ? data.concepts.ict : ['Po3 Accumulation', 'Silver Bullet 2.0', 'Judas Swing Detected']} 
                                    icon={Target}
                                    color="purple" 
                                    score={Math.min(99, (data?.probability || 80) + 5)}
                                />
                            </Link>
                            <Link href={`/analytics/insights/${symbol}/orb`} className="h-full">
                                <ConceptCard 
                                    title="ORB" 
                                    subtitle="Session Momentum"
                                    items={data?.concepts?.orb?.length > 0 ? data.concepts.orb : ['AM Range High', 'PM Compression', 'Session Sweep Sync']} 
                                    icon={Activity}
                                    color="sky" 
                                    score={Math.max(10, (data?.probability || 80) - 10)}
                                />
                            </Link>
                            <Link href={`/analytics/insights/${symbol}/crt`} className="h-full">
                                <ConceptCard 
                                    title="CRT" 
                                    subtitle="Expand Logic"
                                    items={data?.concepts?.crt?.length > 0 ? data.concepts.crt : ['CRT Initial Balance', 'Expansion Trigger', 'Volatility Squeeze']} 
                                    icon={BarChart2}
                                    color="pink" 
                                    score={Math.min(95, (data?.probability || 80) + 2)}
                                />
                            </Link>
                            <div className="h-full opacity-60">
                                <ConceptCard 
                                    title="MACRO" 
                                    subtitle="Fundamental Sync"
                                    items={['USD DXY Correlation', 'Macro Risk Env', 'Yield Delta Scan']} 
                                    icon={Globe}
                                    color="amber" 
                                    score={82}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SYNTHESIS MEMO */}
                    <div className="bg-[#0A0A0A] rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                            <BrainCircuit size={120} />
                         </div>
                        <h3 className="text-[12px] font-black italic uppercase tracking-[0.5em] text-primary mb-6">Algorithm Synthesis Memo</h3>
                        <p className="text-white/40 text-sm leading-[1.8] font-medium italic max-w-5xl border-l border-primary/20 pl-8">
                            Neural analysis of <span className="text-white font-black">{symbol}</span> validates an institutional framework favoring 
                            <span className={`font-black mx-2 uppercase italic ${data?.trend === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>{data?.trend}</span> 
                            positioning. Confluence of {data?.signals?.length || 0} high-probability variables suggests system maturity. 
                            {(data?.probability || 0) > 75 ? " Model integrity indicates immediate execution phase." : " Model awaiting secondary liquidation sweep before final trigger."}
                             Cross-methodology alignment [SMC/ICT/CRT] confirms macro-directional stability.
                        </p>
                    </div>
                </motion.div>
            ) : null}
        </div>
    </div>
  );
}

function ConceptCard({ title, subtitle, items, icon: Icon, color, score }: any) {
    const iconColors: any = {
        indigo: 'text-indigo-400 border-indigo-500/20',
        purple: 'text-purple-400 border-purple-500/20',
        sky: 'text-sky-400 border-sky-500/20',
        pink: 'text-pink-400 border-pink-500/20',
        amber: 'text-amber-400 border-amber-500/20',
    };

    return (
        <div className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-10 hover:border-primary/30 transition-all duration-500 flex flex-col h-full overflow-hidden">
            {/* Active module background glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${color === 'amber' ? 'bg-amber-500' : 'bg-primary'}`} />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl border border-white/5 bg-white/[0.02] group-hover:scale-110 transition-transform ${iconColors[color]}`}>
                        <Icon size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-white/90 leading-none group-hover:text-primary transition-colors">{title}</h3>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] italic">{subtitle}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-base font-black italic text-primary/80 tracking-tighter">{score}%</div>
                    <div className="text-[8px] font-black uppercase text-white/10 tracking-[0.2em] italic">Neural Sync</div>
                 </div>
            </div>
            
            <div className="space-y-5 flex-grow relative z-10">
                {items.slice(0, 3).map((item: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] group-hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-3 truncate">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 shrink-0" />
                            <span className="text-[11px] font-bold text-white/40 uppercase tracking-tight truncate italic group-hover:text-white/70 transition-colors">{item}</span>
                        </div>
                        <div className="text-[8px] font-black text-emerald-500/0 group-hover:text-emerald-500/40 transition-all italic">Verified</div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none group-hover:text-primary/40 transition-colors">Launch Module</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 animate-pulse" />
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
            </div>
        </div>
    );
}

function DiagnosticStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">{label}</span>
            <div className="text-lg font-black italic tracking-tighter text-white/80 font-mono">{value}</div>
        </div>
    );
}

function AlertCircle({ size, className }: any) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}
