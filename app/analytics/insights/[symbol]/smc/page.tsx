"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, TrendingUp, TrendingDown, Target, Zap, 
    Activity, Shield, RefreshCw, 
    Scale, CandlestickChart, Globe, Layout, 
    Eye, MousePointer2, Briefcase, Lock, Compass,
    CheckCircle2, ZapOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enhanced Types
// Enhanced Types matching analysis_engine.ts
interface CandleMetrics { 
    bodySize: number; upperWick: number; lowerWick: number; type: 'BULLISH' | 'BEARISH' | 'DOJI'; range: number; volatility: number; ohlc: { o: number; h: number; l: number; c: number };
    colorType?: 'GREEN' | 'RED' | 'GRAY';
}
interface OrderBlock { 
    index: number; time: string; type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; midpoint: number; mitigated: boolean; 
    freshness: 'UNTAPPED' | 'TAPPED' | 'MITIGATED'; validityScore: number; volume: number; strength: 'WEAK' | 'MODERATE' | 'STRONG'; distance: number; 
    mitigationCandle?: string; reactionCandle?: string; position?: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
}
interface FairValueGap { 
    index: number; time: string; type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; midpoint: number; mitigated: boolean; 
    fillStatus: 'CLEAN' | 'PARTIAL' | 'FULL'; size: number; percentSize: number; distance: number; quality?: 'HIGH' | 'MEDIUM' | 'LOW';
}
interface MarketStructure { index: number; time: string; type: 'BOS' | 'CHOCH' | 'MSS'; direction: 'BULLISH' | 'BEARISH'; price: number; significance: 'MINOR' | 'MAJOR'; strength: 'IMPULSIVE' | 'WEAK'; confirmationTf: string; candleIndex?: number; }
interface LiquidityPool { type: 'EQH' | 'EQL' | 'BSL' | 'SSL' | 'INTERNAL' | 'EXTERNAL'; price: number; strength: number; swept: boolean; }
interface LiquiditySweep { 
    index: number; time: string; type: 'BUYSIDE' | 'SELLSIDE'; sweptLevel: number; sweepWick: number; closePrice: number; reversal: boolean; 
    rejectionStrength: number; multiSweep: boolean; sweepType?: 'HIGH' | 'LOW'; sweepCount?: number; confirmationCandle?: string;
}
interface PremiumDiscountZone { equilibrium: number; premiumStart: number; discountEnd: number; currentZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM'; rangeHigh: number; rangeLow: number; }
interface SessionData { name: string; high: number; low: number; open: string; status: 'PENDING' | 'ACTIVE' | 'CLOSED'; sweepDetected: boolean; }
interface BiasTableRow { timeframe: string; structure: string; bias: string; liquidityTarget: string; }

interface StrategySetup { 
    name: string; methodology: 'SMC' | 'ICT' | 'ORB' | 'CRT'; setup: string; logic: string; confidence: number; entry: number; sl: number; tp1: number; tp2: number; 
    entryConditions: { htfBias: boolean; liqSweep: boolean; confluence: boolean; session: boolean; volatility: boolean; };
    explanation: { why: string; target: string; invalidation: string; controlTf: string; narrative: string };
}

interface TimeframeSMC { 
    timeframe: string; label: string; purpose: string; metrics: CandleMetrics;
    orderBlocks: OrderBlock[]; fairValueGaps: FairValueGap[]; structure: MarketStructure[]; 
    swingHighs: number[]; swingLows: number[]; hh: boolean; hl: boolean; lh: boolean; ll: boolean;
    liquidityPools: LiquidityPool[]; liquiditySweeps: LiquiditySweep[]; premiumDiscount: PremiumDiscountZone; 
    volatility: { atr14: number; atrPercent: number; currentRange: number; avgRange: number; isExpansion: boolean; isContraction: boolean; };
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; confluenceScore: number; 
    candlePatterns: string[];
    po3?: { phase: string; accumulationRange: number; };
    structureDetails?: {
        bos: { index: number; direction: string; strength: string; confirmationTf: string; } | null;
        choch: { index: number; direction: string; level: number; } | null;
    };
}

interface MethodologySpecifics {
    orb?: { orh: number; orl: number; midpoint: number; duration: string; session: string; };
    crt?: { high: number; low: number; midpoint: number; referenceCandle: string; expansion: boolean; };
    ict?: { pdh: number; pdl: number; midnightOpen: number; silverBullet: { active: boolean; zone: string }; killZone: string | null; };
}

interface AdvancedSMC { 
    htfBias: { 
        trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; 
        confluenceScore: number; 
        keyLevel: number; 
        description: string; 
    }; 
    timeframes: TimeframeSMC[]; 
    biasTable: BiasTableRow[];
    methodologySpecifics?: MethodologySpecifics;
    sessions: { 
        asian: SessionData; london: SessionData; ny: SessionData; 
    };
    indicators: { vwap: number; rsi: number; ema20: number; ema50: number; atr?: number; volume?: number; };
    symbolIntelligence: { 
        adr: number; bestSession: string; manipulationTime: string; newsSensitivity: 'HIGH' | 'MEDIUM' | 'LOW'; 
        spreadBehavior?: 'TIGHT' | 'MODERATE' | 'WIDE';
    };
    overallBias: string; confluenceScore: number; strategies: StrategySetup[];
    tradingPlan: { 
        bias: string; entryZone: string; entryPrice: number; stopLoss: number; tp1: number; tp2: number; targets: string; 
        explanation: { why: string; target: string; invalidation: string; controlTf: string; }; 
        riskManagement?: { riskPercent: number; rr: number; positionSize: string; invalidationRules: string[]; };
    }; 
    lastUpdated: string; 
}

interface AnalysisResult { symbol: string; currentPrice: number; trend: string; probability: number; smc_advanced: AdvancedSMC; analyzedAt: string; }

const fmt = (val: number | undefined, decimals?: number): string => {
    if (val === undefined || val === null || isNaN(val)) return '0.00000';
    let d = decimals;
    if (d === undefined) {
        if (Math.abs(val) > 1000) d = 2;
        else if (Math.abs(val) > 100) d = 3;
        else if (Math.abs(val) > 1) d = 5;
        else d = 6;
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

export default function SMCMasterclassPage() {
    const params = useParams();
    const router = useRouter();
    const symbol = (params?.symbol as string)?.toUpperCase() || '';
    
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTF, setActiveTF] = useState<string>('15M');
    
    // Methodology Sync
    const [viewMode, setViewMode] = useState<'SMC' | 'ICT' | 'ORB' | 'CRT'>('SMC');

    const triggerNewAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/insights/forecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol })
            });
            const result = await res.json();
            if (result && result.smc_advanced) {
                setData(result);
            }
        } catch (e) {
            console.error("Analysis error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/insights/forecast?symbol=${symbol}`);
                if (res.ok) {
                    const result = await res.json();
                    if (result && result.smc_advanced) {
                        setData(result);
                        setLoading(false);
                    } else {
                        triggerNewAnalysis();
                    }
                } else {
                    triggerNewAnalysis();
                }
            } catch (e) {
                console.error("Fetch error:", e);
                triggerNewAnalysis();
            }
        };

        if (symbol) {
            fetchInitial();
        }
    }, [symbol]);

    const handleModeSwitch = (mode: string) => {
        const target = `/analytics/insights/${symbol}/${mode.toLowerCase()}`;
        router.push(target);
    };

    const getDynamicLabel = (type: string) => {
        if (viewMode === 'ORB') {
            switch(type) {
                case 'OB': return 'Range Edge';
                case 'FVG': return 'Breakout Gap';
                case 'Structure': return 'Momentum Shift';
                case 'Liquidity': return 'Range Liquidity';
                case 'PD': return 'Session Range';
                default: return type;
            }
        }
        if (viewMode === 'CRT') {
            switch(type) {
                case 'OB': return 'Rejection Zone';
                case 'FVG': return 'Expansion Gap';
                case 'Structure': return 'Contracted Bias';
                case 'Liquidity': return 'Stop Hunts';
                case 'PD': return 'Volatility Range';
                default: return type;
            }
        }
        if (viewMode === 'ICT') {
            switch(type) {
                case 'OB': return 'Breaker Block';
                case 'FVG': return 'Efficiency Gap';
                case 'Structure': return 'Core Structure';
                case 'Liquidity': return 'Institutional Sweep';
                case 'PD': return 'OTE Zone';
                default: return type;
            }
        }
        return type;
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Matrix...</span>
        </div>
    );

    if (!data?.smc_advanced) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 gap-4">
            <ZapOff size={48} className="text-muted-foreground/20" />
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">No Matrix Data</h2>
            <Button onClick={() => router.back()} variant="outline" className="rounded-full">Back to Overview</Button>
        </div>
    );

    const smc = data.smc_advanced;
    const tfData = smc.timeframes.find(t => t.timeframe === activeTF) || smc.timeframes[0];
    const bestStrategy = smc.strategies?.find(s => s.methodology === viewMode) || smc.strategies?.[0];

    return (
        <div className="min-h-screen bg-[#050505] text-foreground p-4 md:p-12 font-sans pb-32 relative overflow-hidden selection:bg-primary/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#050505]">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            <div className="max-w-[1800px] mx-auto space-y-12">
                
                {/* Institutional Header */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/5 pb-8 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => router.back()} className="h-10 w-10 border-white/5 p-0 rounded-xl bg-card/40 backdrop-blur-3xl transition-transform hover:scale-105 active:scale-95">
                                <ArrowLeft size={18} />
                            </Button>
                            <Button variant="outline" onClick={triggerNewAnalysis} className="h-10 w-10 border-white/5 p-0 rounded-xl bg-card/40 backdrop-blur-3xl transition-transform hover:scale-105 active:scale-95 group">
                                <RefreshCw size={16} className={`${loading ? 'animate-spin' : 'group-active:animate-spin'}`} />
                            </Button>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <Activity size={8} className="text-emerald-500 animate-pulse" />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500">Neural Sync</span>
                                </div>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black tracking-[-0.04em] italic uppercase leading-none truncate whitespace-nowrap">
                                <span className="text-primary">{symbol}</span> <span className="text-foreground/10">|</span> {viewMode} MASTER
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <TopMetric label="Bias" value={smc.overallBias?.replace('_', ' ') || 'NEUTRAL'} color={smc.overallBias?.includes('BULLISH') ? 'emerald' : 'rose'} />
                        <TopMetric label="Matrix" value={`${smc.confluenceScore || 0}%`} />
                        <TopMetric label="Market Spot" value={`$${fmt(data.currentPrice)}`} />
                    </div>
                </header>

                {/* Main Control Hub */}
                <div className="flex flex-wrap items-center justify-between gap-8 pb-4">
                    <div className="flex flex-wrap items-center gap-8">
                         <div className="bg-card/40 backdrop-blur-3xl border border-white/5 p-1 rounded-[2rem] flex gap-1">
                            {['SMC', 'ICT', 'ORB', 'CRT'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleModeSwitch(m)}
                                    className={`px-6 py-2.5 rounded-[1.5rem] text-[9px] font-black transition-all uppercase tracking-[0.2em] ${viewMode === m ? 'bg-primary text-primary-foreground shadow-xl scale-105 px-8' : 'text-foreground/40 hover:text-foreground'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1 bg-card/40 backdrop-blur-3xl border border-white/5 p-1 rounded-[2rem]">
                            {smc.timeframes?.map((tf) => (
                                <button
                                    key={tf.timeframe}
                                    onClick={() => setActiveTF(tf.timeframe)}
                                    className={`px-6 py-2.5 rounded-[1.5rem] text-[9px] font-black transition-all uppercase tracking-[0.2em] ${activeTF === tf.timeframe ? 'bg-foreground text-background shadow-xl scale-105' : 'text-foreground/40 hover:text-foreground'}`}
                                >
                                    {tf.label} {tf.timeframe === '4H' && '(HTF)'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 px-8 py-3 bg-white/[0.02] border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                        <span>ATR: {fmt(tfData.volatility?.atr14, 4)}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span>ADR: {fmt(smc.symbolIntelligence?.adr, 2)}</span>
                    </div>
                </div>

                {/* MAIN INSTITUTIONAL MATRIX - 15 POINT LAYOUT */}
                <div className="space-y-8">
                    
                    {/* 15. Collapsible AI Analysis Panel */}
                    <div className="w-full">
                        <AINarrativePanel strategy={bestStrategy} loading={loading} />
                    </div>


                    {/* 1. Tactical Execution Protocol (FULL WIDTH) */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-12 relative overflow-hidden w-full">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none" />
                        
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-8 space-y-10">
                                <div className="flex items-center gap-6">
                                    <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20">
                                        <Shield size={32} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground/90 leading-none mb-2">Institutional Execution Plan</h3>
                                        <div className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.4em] italic">Methodology: {viewMode} // Protocol: {bestStrategy?.name || 'Scanning Model...'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <ExecutionCard label="Exact Entry" value={`$${fmt(bestStrategy?.entry || smc.tradingPlan?.entryPrice)}`} icon={MousePointer2} />
                                    <ExecutionCard label="Invalidation SL" value={`$${fmt(bestStrategy?.sl || smc.tradingPlan?.stopLoss)}`} icon={Lock} color="rose" />
                                    <ExecutionCard label="TP Objective 1" value={`$${fmt(bestStrategy?.tp1 || smc.tradingPlan?.tp1)}`} icon={Target} color="emerald" />
                                    <ExecutionCard label="TP Objective 2" value={`$${fmt(bestStrategy?.tp2 || smc.tradingPlan?.tp2)}`} icon={TrendingUp} color="emerald" />
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4 italic">Algorithmic Synthesis & Logic</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ExplanationItem label="Logic Synthesis" value={bestStrategy?.logic || smc.tradingPlan.explanation?.why || 'Scanning logic...'} />
                                        <ExplanationItem label="Target Objective" value={smc.tradingPlan.explanation?.target || 'Identifying objectives...'} />
                                        <ExplanationItem label="Invalidation Logic" value={smc.tradingPlan.explanation?.invalidation || 'Calculating risk...'} />
                                        <ExplanationItem label="Controlling TF" value={smc.tradingPlan.explanation?.controlTf || 'Detecting HTF...'} />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex flex-col justify-center border-l border-white/5 pl-12 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Matrix Conditions</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {viewMode === 'SMC' && (
                                            <>
                                                <ConditionItem label="SMC Structure Alignment" active={bestStrategy?.entryConditions?.htfBias} />
                                                <ConditionItem label="External Liquidity Purge" active={bestStrategy?.entryConditions?.liqSweep} />
                                                <ConditionItem label="Fair Value Convergence" active={bestStrategy?.entryConditions?.confluence} />
                                                <ConditionItem label="Power of 3 (PO3) State" active={tfData.po3?.phase !== 'ACCUMULATION'} />
                                                <ConditionItem label="Silver Bullet Kill Zone" active={bestStrategy?.entryConditions?.session} />
                                            </>
                                        )}
                                        {viewMode === 'ICT' && (
                                            <>
                                                <ConditionItem label="Power of 3 (PO3) State" active={tfData.po3?.phase !== 'ACCUMULATION'} />
                                                <ConditionItem label="Silver Bullet Window" active={bestStrategy?.entryConditions?.session} />
                                                <ConditionItem label="Judas Swing Detected" active={bestStrategy?.entryConditions?.liqSweep} />
                                                <ConditionItem label="Liquidity Run Maturity" active={bestStrategy?.entryConditions?.confluence} />
                                                <ConditionItem label="Fair Value Convergence" active={bestStrategy?.entryConditions?.htfBias} />
                                            </>
                                        )}
                                        {viewMode === 'ORB' && (
                                            <>
                                                <ConditionItem label="Opening Range Zone" active={bestStrategy?.entryConditions?.session} />
                                                <ConditionItem label="Breakout Momentum" active={bestStrategy?.entryConditions?.volatility} />
                                                <ConditionItem label="Volume Confirmation" active={bestStrategy?.entryConditions?.confluence} />
                                                <ConditionItem label="Session Wrap Sync" active={bestStrategy?.entryConditions?.htfBias} />
                                                <ConditionItem label="30M Range Validity" active={bestStrategy?.entryConditions?.liqSweep} />
                                            </>
                                        )}
                                        {viewMode === 'CRT' && (
                                            <>
                                                <ConditionItem label="Range Compression" active={tfData.volatility?.isContraction} />
                                                <ConditionItem label="Expansion Gap Shift" active={bestStrategy?.entryConditions?.volatility} />
                                                <ConditionItem label="Manipulation Wick" active={bestStrategy?.entryConditions?.liqSweep} />
                                                <ConditionItem label="Volatility Spike Sync" active={bestStrategy?.entryConditions?.confluence} />
                                                <ConditionItem label="Accumulation Rejection" active={bestStrategy?.entryConditions?.htfBias} />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-white/5 space-y-4">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">Convergence Score</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black italic tracking-tighter text-primary">{bestStrategy?.confidence || smc.confluenceScore || 0}%</span>
                                        <span className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest">Confidence</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7. Multi-Timeframe Alignment Engine (Bias Table) */}
                     <InstitutionalCard title="Multi-Timeframe Alignment" icon={Layout}>
                        <BiasTable rows={smc.biasTable || []} />
                    </InstitutionalCard>

                    {/* 1. Core Market Data Price & Candle Data */}
                    <InstitutionalCard title="Core Price & Candle Forensics" icon={CandlestickChart}>
                         <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {['4H','15M','5M','1M'].map(tf => (
                                <button 
                                    key={tf}
                                    onClick={() => setActiveTF(tf)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTF === tf ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                                >
                                    {tf}
                                </button>
                            ))}
                         </div>
                         <CoreDataGrid metrics={tfData.metrics} timeframe={activeTF} />
                    </InstitutionalCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 2. Market Structure (SMC Core) */}
                        <InstitutionalCard title="Market Structure Architecture" icon={TrendingUp}>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trend ({activeTF})</span>
                                    <span className={`text-xs font-black uppercase italic ${tfData.trend === 'BULLISH' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tfData.trend}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">BOS Status</div>
                                        <div className="text-[10px] font-bold font-mono">
                                            {tfData.structureDetails?.bos ? 'CONFIRMED' : 'WAITING'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">CHOCH Status</div>
                                        <div className="text-[10px] font-bold font-mono">
                                             {tfData.structureDetails?.choch ? 'DETECTED' : 'NONE'}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </InstitutionalCard>

                        {/* 3. Liquidity Concepts */}
                        <InstitutionalCard title="Liquidity Mechanics" icon={Zap}>
                            <div className="space-y-3">
                                {tfData.liquiditySweeps.length === 0 ? (
                                    <div className="text-[10px] text-muted-foreground italic text-center py-4">No recent major sweeps detected</div>
                                ) : (
                                    tfData.liquiditySweeps.map((sweep, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-primary/20">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${sweep.type === 'BUYSIDE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <span className="text-[10px] font-bold text-foreground/90 uppercase">{sweep.type} SWEEP</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-primary">{fmt(sweep.sweptLevel)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </InstitutionalCard>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 4. Order Blocks & 5. FVGs */}
                        <InstitutionalCard title="Institutional Arrays (OB/FVG)" icon={Briefcase}>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pl-1">Active Order Blocks</div>
                                    {tfData.orderBlocks.slice(0, 2).map((ob, i) => (
                                        <div key={i} className={`p-3 rounded-lg border flex justify-between ${ob.type === 'BULLISH' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                            <span className="text-[10px] font-bold opacity-80">{ob.type} OB</span>
                                            <span className="text-[10px] font-mono opacity-60">Vol: {ob.validityScore}%</span>
                                        </div>
                                    ))}
                                </div>
                                 <div className="space-y-2">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pl-1">Imbalance (FVG)</div>
                                    {tfData.fairValueGaps.slice(0, 2).map((fvg, i) => (
                                        <div key={i} className="p-3 rounded-lg border border-white/10 bg-white/5 flex justify-between">
                                            <span className="text-[10px] font-bold opacity-80">{fvg.type} FVG</span>
                                            <span className="text-[10px] font-mono opacity-60">{fvg.fillStatus}</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </InstitutionalCard>
                    </div>

                {/* 3. Technical Forensics & Structure */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <TechnicalSection title="Core Market Data" icon={CandlestickChart}>
                         <div className="space-y-8">
                            {/* OHLC Snapshot */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-white/5">
                                 <OHLC_Item label="OPEN" value={fmt(tfData.metrics?.ohlc?.o)} />
                                 <OHLC_Item label="HIGH" value={fmt(tfData.metrics?.ohlc?.h)} />
                                 <OHLC_Item label="LOW" value={fmt(tfData.metrics?.ohlc?.l)} />
                                 <OHLC_Item label="CLOSE" value={fmt(tfData.metrics?.ohlc?.c)} />
                            </div>

                            {/* Candle Architecture */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-8 p-2">
                                <TechnicalMetric 
                                    label="Candle Body Size" 
                                    value={fmt(tfData.metrics?.bodySize, 4)} 
                                    subValue={`${(((tfData.metrics?.bodySize||0) / (tfData.metrics?.range||1))*100).toFixed(1)}% Fill Ratio`} 
                                />
                                <TechnicalMetric 
                                    label="Total Range (H-L)" 
                                    value={fmt(tfData.metrics?.range, 4)} 
                                    subValue="Point Expansion" 
                                />
                                <TechnicalMetric 
                                    label="Wick Size (Upper)" 
                                    value={fmt(tfData.metrics?.upperWick, 4)} 
                                    subValue="Rejection Delta" 
                                />
                                <TechnicalMetric 
                                    label="Wick Size (Lower)" 
                                    value={fmt(tfData.metrics?.lowerWick, 4)} 
                                    subValue="Absorption Delta" 
                                />
                                <TechnicalMetric 
                                    label="Volatility (ATR)" 
                                    value={fmt(tfData.volatility?.atr14, 5)} 
                                    subValue={`${tfData.volatility?.atrPercent.toFixed(2)}% Intensity`} 
                                />
                                <TechnicalMetric 
                                    label="Range State" 
                                    value={tfData.volatility?.isExpansion ? 'Expansion' : tfData.volatility?.isContraction ? 'Contraction' : 'Normal'} 
                                    subValue="Structural Phase" 
                                />
                            </div>
                            
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-primary/20 pb-1 mb-2 w-fit">Candle Signature</div>
                                    <div className="text-xl font-black italic uppercase tracking-tight text-primary">{tfData.metrics?.type || 'NEUTRAL'} TYPE</div>
                                </div>
                                <div className={`p-5 rounded-full ${tfData.metrics?.type === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]'}`}>
                                    {tfData.metrics?.type === 'BULLISH' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                                </div>
                            </div>
                         </div>

                        {/* Candle Patterns */}
                        {tfData.candlePatterns && tfData.candlePatterns.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2 pt-8 border-t border-white/5">
                                {tfData.candlePatterns.map((p, i) => (
                                    <span key={i} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest text-primary italic">
                                        {p} Pattern Detected
                                    </span>
                                ))}
                            </div>
                        )}
                    </TechnicalSection>

                    <TechnicalSection title={getDynamicLabel('Structure')} icon={TrendingUp}>
                         <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border border-white/5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest">
                            <span>HTF Alignment: <span className="text-primary">{tfData.trend}</span></span>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>Phase: <span className="text-primary">{tfData.po3?.phase || (tfData.volatility?.isExpansion ? 'EXPN' : 'CONTR')}</span></span>
                        </div>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                            {tfData.structure?.map((s, i) => (
                                <StructureFlowItem key={i} structure={s} getDynamicLabel={getDynamicLabel} />
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-8">
                            <StructureState label="HH" active={tfData.hh} />
                            <StructureState label="HL" active={tfData.hl} />
                            <StructureState label="LH" active={tfData.lh} />
                            <StructureState label="LL" active={tfData.ll} />
                        </div>
                    </TechnicalSection>

                    <TechnicalSection title={`Institutional ${getDynamicLabel('OB')}s`} icon={Briefcase} count={(tfData.orderBlocks?.length || 0) + (tfData.fairValueGaps?.length || 0)}>
                        <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                            <div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 italic">Supply / Demand Blocks</div>
                                <div className="space-y-4">
                                    {tfData.orderBlocks?.map((ob, i) => (
                                        <OB_Card key={i} ob={ob} getDynamicLabel={getDynamicLabel} />
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 italic">Efficiency Gaps ({getDynamicLabel('FVG')})</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tfData.fairValueGaps?.map((fvg, i) => (
                                        <FVG_Card key={i} fvg={fvg} getDynamicLabel={getDynamicLabel} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TechnicalSection>
                </div>

                {/* 4. Environmental Intelligence */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TechnicalSection title={`${getDynamicLabel('Liquidity')} Pools`} icon={Eye}>
                        <div className="space-y-4">
                            {tfData.liquidityPools?.length > 0 ? tfData.liquidityPools.map((pool, i) => (
                                <LiquidityItem key={i} pool={pool} getDynamicLabel={getDynamicLabel} />
                            )) : (
                                <div className="p-8 rounded-[2.5rem] border border-dashed border-white/10 text-center">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">Scanning External Range...</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 italic">Recent Stop Hunts</div>
                            <div className="space-y-3">
                                {tfData.liquiditySweeps?.map((ls, i) => (
                                    <SweepLogItem key={i} sweep={ls} getDynamicLabel={getDynamicLabel} />
                                ))}
                            </div>
                        </div>
                    </TechnicalSection>

                    <TechnicalSection title="Session Kill Zones" icon={Globe}>
                        <div className="space-y-6">
                            <SessionCard session={smc.sessions?.asian} color="indigo" />
                            <SessionCard session={smc.sessions?.london} color="sky" />
                            <SessionCard session={smc.sessions?.ny} color="amber" />
                        </div>
                        <div className="mt-10 p-8 bg-primary/5 border border-primary/20 rounded-[3rem] space-y-4 relative overflow-hidden group">
                            <Compass size={64} className="absolute -bottom-8 -right-8 text-primary/10 transition-transform group-hover:scale-125 duration-700" />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic">Global Intelligence</h4>
                            <div className="space-y-5 relative z-10">
                                <IntelItem label="Best Scalp Session" value={smc.symbolIntelligence?.bestSession || 'N/A'} />
                                <IntelItem label="Manipulation Window" value={smc.symbolIntelligence?.manipulationTime || 'N/A'} />
                                <IntelItem label="News Sensitivity" value={smc.symbolIntelligence?.newsSensitivity || 'MEDIUM'} />
                                <div className="pt-3 border-t border-white/5 mt-3 space-y-4">
                                    <div className="text-[8px] font-black text-primary/30 uppercase tracking-[0.3em] italic">Macro Correlations</div>
                                    <IntelItem label="USD Index Strength" value="BULLISH" />
                                    <IntelItem label="Risk Environment" value="ON (Risk-On)" />
                                </div>
                            </div>
                        </div>
                    </TechnicalSection>

                    <TechnicalSection title={getDynamicLabel('PD')} icon={Scale}>
                        <div className="relative py-12 group">
                            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/5 group-hover:bg-primary/20 transition-all rounded-full" />
                            <div className="space-y-24 relative">
                                <PD_Level label="Premium (Short)" price={tfData.premiumDiscount?.rangeHigh} color="rose" active={tfData.premiumDiscount?.currentZone === 'PREMIUM'} />
                                <PD_Level label="Equilibrium" price={tfData.premiumDiscount?.equilibrium} color="muted" active={tfData.premiumDiscount?.currentZone === 'EQUILIBRIUM'} />
                                <PD_Level label="Discount (Long)" price={tfData.premiumDiscount?.rangeLow} color="emerald" active={tfData.premiumDiscount?.currentZone === 'DISCOUNT'} />
                            </div>
                            <motion.div 
                                className="absolute left-4 right-4 h-1.5 bg-foreground shadow-[0_0_30px_white/50] z-20 rounded-full" 
                                animate={{ 
                                    top: tfData.premiumDiscount?.rangeHigh && data?.currentPrice ? 
                                        `${Math.max(10, Math.min(90, ((tfData.premiumDiscount.rangeHigh - data.currentPrice) / (tfData.premiumDiscount.rangeHigh - tfData.premiumDiscount.rangeLow)) * 100))}%` 
                                        : '50%'
                                }} 
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            >
                                <div className="absolute -right-16 -top-2 px-3 py-1 bg-foreground text-background text-[9px] font-black rounded-full whitespace-nowrap">
                                    CURRENT
                                </div>
                            </motion.div>
                        </div>
                        
                        {/* 14. AI Trade Engine (Auto Entry / SL / TP) */}
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4"> 
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4 italic">Trade Management</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Entry Price</div>
                                    <div className="text-sm font-bold font-mono text-primary">{fmt(smc.tradingPlan.entryPrice)}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Stop Loss</div>
                                    <div className="text-sm font-bold font-mono text-rose-500">{fmt(smc.tradingPlan.stopLoss)}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">TP 1</div>
                                    <div className="text-sm font-bold font-mono text-emerald-500">{fmt(smc.tradingPlan.tp1)}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">TP 2</div>
                                    <div className="text-sm font-bold font-mono text-emerald-500">{fmt(smc.tradingPlan.tp2)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic leading-relaxed">
                                Neural engine enforces: <br/> 
                                <span className="text-primary">{tfData.premiumDiscount?.currentZone === 'DISCOUNT' ? 'Long Bias Confirmed in Discount' : tfData.premiumDiscount?.currentZone === 'PREMIUM' ? 'Short Bias Confirmed in Premium' : 'Equilibrium Phase - Wait for Displacement'}</span>
                            </span>
                        </div>
                    </TechnicalSection>
                </div>

                </div>

                <footer className="text-center py-20 space-y-4 opacity-30">
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[1em] italic">AtomicLedger Neural Execution Environment // {viewMode} Ver 4.2.0</p>
                    <div className="text-[9px] font-bold text-muted-foreground italic tracking-widest px-20 max-w-4xl mx-auto leading-relaxed">
                        Data Synthesized from institutional feeds using multi-timeframe structural logic. Every calculation is derived from real-time volatility and structural shifts.
                    </div>
                </footer>

            </div>
        </div>
    );
}

// ===== NEW COMPONENTS =====

function InstitutionalCard({ title, icon: Icon, children, className = "" }: any) {
    return (
        <div className={`bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group hover:border-white/10 transition-colors ${className}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Icon size={100} />
            </div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Icon size={20} className="text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80 italic">{title}</h3>
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

function CoreDataGrid({ metrics, timeframe }: { metrics: CandleMetrics, timeframe: string }) {
    if (!metrics) return null;
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="space-y-4 col-span-2">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">OHLC Data ({timeframe})</div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div><div className="text-[10px] text-muted-foreground">O</div><div className="font-mono text-xs font-bold">{metrics.ohlc?.o?.toFixed(2)}</div></div>
                        <div><div className="text-[10px] text-muted-foreground">H</div><div className="font-mono text-xs font-bold">{metrics.ohlc?.h?.toFixed(2)}</div></div>
                        <div><div className="text-[10px] text-muted-foreground">L</div><div className="font-mono text-xs font-bold">{metrics.ohlc?.l?.toFixed(2)}</div></div>
                        <div><div className="text-[10px] text-muted-foreground">C</div><div className="font-mono text-xs font-bold">{metrics.ohlc?.c?.toFixed(2)}</div></div>
                    </div>
                </div>
             </div>
             <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Candle Type</div>
                <div className={`font-black text-sm uppercase italic ${metrics.colorType === 'GREEN' ? 'text-emerald-500' : metrics.colorType === 'RED' ? 'text-rose-500' : 'text-gray-500'}`}>
                    {metrics.type}
                </div>
                <div className="text-[9px] text-muted-foreground mt-1 font-mono">Body: {metrics.bodySize?.toFixed(1)}</div>
             </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Volatility</div>
                <div className="font-mono text-sm font-bold text-primary">{metrics.volatility?.toFixed(4)}</div>
                <div className="text-[9px] text-muted-foreground mt-1">Range: {metrics.range?.toFixed(1)}</div>
             </div>
        </div>
    );
}

function BiasTable({ rows }: { rows: BiasTableRow[] }) {
    if (!rows || rows.length === 0) return null;
    return (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
            <table className="w-full text-left text-[10px] uppercase font-bold tracking-wider">
                <thead className="bg-white/5 text-muted-foreground">
                    <tr>
                        <th className="p-3">Timeframe</th>
                        <th className="p-3">Structure</th>
                        <th className="p-3">Bias</th>
                        <th className="p-3 text-right">Liquidity Target</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rows.map((row, i) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 font-black text-primary">{row.timeframe}</td>
                            <td className={`p-3 ${row.structure.includes('BULL') ? 'text-emerald-400' : row.structure.includes('BEAR') ? 'text-rose-400' : 'text-gray-400'}`}>{row.structure}</td>
                            <td className="p-3">{row.bias}</td>
                            <td className="p-3 text-right font-mono text-muted-foreground/80">{row.liquidityTarget}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ===== COMPONENTS =====

function TopMetric({ label, value, color }: any) {
    const colorClass = color === 'emerald' ? 'text-emerald-500' : color === 'rose' ? 'text-rose-500' : 'text-foreground';
    return (
        <div className="bg-card/40 border border-white/5 px-6 py-2.5 rounded-2xl text-center shadow-sm backdrop-blur-3xl min-w-[120px]">
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 italic opacity-50">{label}</div>
            <div className={`text-xs font-black uppercase italic tracking-tighter ${colorClass}`}>{value}</div>
        </div>
    );
}

function TechnicalSection({ title, icon: Icon, count, children }: any) {
    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/[0.03] rounded-2xl ring-1 ring-white/5 group-hover:ring-primary/20 transition-all">
                        <Icon size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter text-foreground/90 italic">{title}</h3>
                </div>
                {count !== undefined && (
                    <span className="text-[10px] font-black bg-white/5 px-3 py-1.5 rounded-full text-muted-foreground uppercase tracking-widest">{count} Active</span>
                )}
            </div>
            <div className="flex-grow relative z-10">
                {children}
            </div>
        </div>
    );
}

function AINarrativePanel({ strategy, loading }: { strategy: StrategySetup | undefined; loading: boolean }) {
    const [isOpen, setIsOpen] = useState(true);

    if (loading || !strategy) return null;

    return (
        <div className="border border-primary/30 bg-primary/5 rounded-[3rem] overflow-hidden transition-all duration-500 relative group/narrative">
             <div 
                className="flex items-center justify-between p-8 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/20 rounded-[1.5rem] shadow-lg shadow-primary/10 group-hover/narrative:scale-110 transition-transform duration-500">
                        <Zap size={24} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-primary/60 italic mb-1">Neural Narrative Processor</h3>
                        <div className="text-2xl font-black italic uppercase tracking-tighter text-foreground/90 leading-none">
                            {strategy.name} <span className="text-primary/40 text-lg">Execution Protocol</span>
                        </div>
                    </div>
                </div>
                <div className={`p-3 rounded-full border border-white/5 bg-white/5 transition-all duration-500 ${isOpen ? 'rotate-180 bg-primary/20 border-primary/30' : ''}`}>
                    <ArrowLeft size={16} className="-rotate-90 text-primary/50" />
                </div>
            </div>

            {isOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="px-10 pb-10"
                >
                    <div className="space-y-10 pt-8 border-t border-white/10">
                        {/* Market Context Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-center">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                                        <Globe size={12} className="text-primary/60" /> Market Context & Institutional Narrative
                                    </div>
                                    <p className="text-xl font-medium text-foreground/90 leading-relaxed italic border-l-[3px] border-primary/40 pl-8 py-2 relative">
                                        <span className="absolute left-0 top-0 text-6xl text-primary/10 select-none">"</span>
                                        {strategy.explanation?.narrative || 'Aggregating order flow data and structural shifts for synthesis...'}
                                        <span className="absolute bottom-0 right-0 text-6xl text-primary/10 select-none">"</span>
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-primary/60 uppercase tracking-[0.5em] flex items-center gap-3">
                                        <CheckCircle2 size={12} className="text-primary/40" /> Validation Logic
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-loose max-w-3xl">
                                        {strategy.explanation?.why}
                                    </p>
                                </div>
                            </div>

                            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic text-center pb-4 border-b border-white/5">
                                    Tactical Profile
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Target Objective</div>
                                        <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-snug">{strategy.explanation?.target}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Invalidation Profile</div>
                                        <div className="text-[11px] font-black text-rose-400 uppercase tracking-widest leading-snug">{strategy.explanation?.invalidation}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Controlling Timeframes</div>
                                        <div className="text-[11px] font-black text-amber-400 uppercase tracking-widest">{strategy.explanation?.controlTf}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Convergence Badge */}
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 via-transparent to-transparent border border-primary/20 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.5em] mb-1">Convergence Index</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black italic tracking-tighter text-primary">{(strategy.confidence || 0).toFixed(0)}%</span>
                                        <span className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">Algorithmic Confidence</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] italic pr-4">
                                Neural engine enforces strict validation
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function TechnicalMetric({ label, value, subValue }: any) {
    return (
        <div className="space-y-2">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 italic">{label}</div>
            <div className="text-lg font-black font-mono tracking-tight text-foreground/90 leading-none">{value}</div>
            <div className="text-[9px] font-bold text-primary/40 uppercase tracking-widest italic">{subValue}</div>
        </div>
    );
}

function ExecutionCard({ label, value, icon: Icon, color }: any) {
    const colorClass = color === 'rose' ? 'text-rose-400' : color === 'emerald' ? 'text-emerald-400' : 'text-primary';
    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:bg-white/[0.05] transition-all relative">
            <div className={`p-4 bg-primary/5 border border-primary/10 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform w-fit`}>
                <Icon size={22} />
            </div>
            <div>
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 mb-2 italic">{label}</div>
                <div className={`text-xl font-black italic tracking-tighter leading-none ${colorClass}`}>{value}</div>
            </div>
        </div>
    );
}

function ExplanationItem({ label, value }: any) {
    return (
        <div className="space-y-3 min-h-[80px]">
            <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em] italic">{label}</div>
            <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4 break-words">
                {value}
            </p>
        </div>
    );
}

function ConditionItem({ label, active }: any) {
    return (
        <div className="flex items-center gap-4 group">
            <div className={`w-2 h-2 rounded-full transition-all ${active ? 'bg-emerald-500' : 'bg-white/10'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${active ? 'text-foreground/90' : 'text-muted-foreground/30'}`}>{label}</span>
            {active && <CheckCircle2 size={12} className="text-emerald-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
    );
}

function StructureFlowItem({ structure, getDynamicLabel }: any) {
    const isMajor = structure.significance === 'MAJOR';
    return (
        <div className={`p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] shadow-xl group hover:border-primary/40 transition-all ${!isMajor && 'opacity-60'}`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl border border-white/5 group-hover:bg-primary/5 transition-colors ${structure.type === 'CHOCH' ? 'text-amber-500' : structure.type === 'MSS' ? 'text-primary' : 'text-muted-foreground/30'}`}>
                        {structure.type === 'CHOCH' ? <RefreshCw size={20} /> : structure.type === 'MSS' ? <Zap size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[12px] font-black uppercase tracking-tight">{structure.type} <span className={structure.direction === 'BULLISH' ? 'text-emerald-500' : 'text-rose-500'}>[{structure.direction}]</span></span>
                            {isMajor && <span className="text-[8px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">Major</span>}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground/40 mt-1 font-mono tracking-tighter italic">{structure.time}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black italic tracking-tighter text-foreground/90">${fmt(structure.price)}</div>
                    <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mt-1">{getDynamicLabel('Structure')} {structure.strength}</div>
                </div>
            </div>
        </div>
    );
}

function StructureState({ label, active }: any) {
    return (
        <div className={`py-4 rounded-[1.5rem] border text-center transition-all ${active ? 'bg-primary/10 border-primary/20 text-primary scale-105 shadow-xl' : 'border-white/5 text-muted-foreground/20'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest italic">{label}</span>
        </div>
    );
}

function OB_Card({ ob, getDynamicLabel }: any) {
    return (
        <div className={`p-6 rounded-[2.5rem] border transition-all hover:scale-[1.02] group relative overflow-hidden ${ob.mitigated ? 'bg-white/[0.01] border-white/5 opacity-40 grayscale' : 'bg-card border-white/10 shadow-2xl hover:border-primary/40'}`}>
            <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-4">
                    <div className={`w-1.5 h-12 rounded-full ${ob.type === 'BULLISH' ? 'bg-emerald-500' : 'bg-rose-500'} group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-shadow`} />
                    <div className="space-y-1">
                        <div className="text-[11px] font-black uppercase tracking-widest">{ob.type} {ob.strength} {getDynamicLabel('OB').toUpperCase()}</div>
                        <div className="text-[9px] font-black text-muted-foreground/40 italic uppercase tracking-[0.2em]">{ob.freshness}</div>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-base font-black italic tracking-tighter font-mono">${fmt(ob.midpoint)}</div>
                    <div className="text-[8px] font-black text-primary/40 uppercase tracking-[0.1em] italic">Validity: {ob.validityScore}%</div>
                </div>
            </div>
        </div>
    );
}

function FVG_Card({ fvg, getDynamicLabel }: any) {
    return (
        <div className={`p-5 rounded-[2rem] border transition-all ${fvg.mitigated ? 'opacity-20 border-white/5' : 'bg-white/[0.02] border-white/5 hover:border-primary/20 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${fvg.type === 'BULLISH' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{getDynamicLabel('FVG').toUpperCase()} [{fvg.type}]</span>
                 </div>
                 <span className="text-[8px] font-black text-muted-foreground/20 uppercase font-mono tracking-tighter">{fvg.fillStatus}</span>
            </div>
            <div className="text-center space-y-1">
                 <div className="text-sm font-black italic font-mono tracking-tight text-foreground/80">${fmt(fvg.midpoint)}</div>
                 <div className="text-[8px] font-bold text-primary/30 uppercase tracking-[0.2em] italic">DISP: {fmt(fvg.percentSize, 3)}%</div>
            </div>
        </div>
    );
}

function LiquidityItem({ pool, getDynamicLabel }: any) {
    return (
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                    <Activity size={16} />
                </div>
                <div>
                    <div className="text-[11px] font-black uppercase tracking-tight italic">{(pool.type === 'INTERNAL' || pool.type === 'EXTERNAL') ? getDynamicLabel('Liquidity') : pool.type} POOL</div>
                    <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.1em] mt-0.5">{pool.strength > 80 ? 'HIGH PROB' : 'EXTERNAL'}</div>
                </div>
            </div>
            <div className="text-base font-black italic font-mono tracking-tighter text-foreground/80">${fmt(pool.price)}</div>
        </div>
    );
}

function SweepLogItem({ sweep, getDynamicLabel }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
             <div className="flex items-center gap-4">
                <div className={`w-1.5 h-1.5 rounded-full ${sweep.type === 'BUYSIDE' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{sweep.type} {getDynamicLabel('Liquidity')} SWEEP</span>
             </div>
             <span className="text-[10px] font-black font-mono italic text-foreground/40">${fmt(sweep.sweptLevel)}</span>
        </div>
    );
}

function SessionCard({ session, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    };
    if (!session) return (
        <div className={`p-6 rounded-[2.5rem] border border-dashed border-white/5 opacity-20 flex items-center justify-between`}>
             <div className="text-[10px] font-black uppercase tracking-[0.3em] italic">Scanning Session...</div>
        </div>
    );
    return (
        <div className={`p-6 rounded-[2.5rem] border flex items-center justify-between group transition-all hover:scale-[1.02] ${colors[color]}`}>
            <div className="flex items-center gap-5">
                <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5">
                    <Globe size={20} />
                </div>
                <div>
                    <div className="text-[12px] font-black uppercase tracking-[0.2em]">{session.name} Session</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 italic">Status: {session.status}</span>
                        {session.sweepDetected && <div className="text-[8px] font-black bg-current bg-opacity-10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Sweep 🔥</div>}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm font-black font-mono tracking-tighter italic opacity-80">${fmt(session.high)}</div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mt-1">Open: {session.open}</div>
            </div>
        </div>
    );
}

function IntelItem({ label, value }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest italic">{label}</span>
            <span className="text-[11px] font-black text-foreground italic uppercase italic tracking-tight">{value}</span>
        </div>
    );
}

function PD_Level({ label, price, color, active }: any) {
    const textColor = color === 'rose' ? 'text-rose-500' : color === 'emerald' ? 'text-emerald-500' : 'text-muted-foreground';
    return (
        <div className={`flex items-center justify-between bg-card/80 p-6 border border-white/5 rounded-[2rem] shadow-2xl transition-all relative ${active && 'scale-105 border-primary/40'}`}>
            {active && <div className="absolute inset-0 bg-primary/5 rounded-[2rem] animate-pulse" />}
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${textColor}`}>{label}</span>
            <span className="text-lg font-black italic tracking-tighter text-foreground font-mono leading-none">${fmt(price)}</span>
        </div>
    );
}

function SmallStat({ label, value }: any) {
    return (
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-[1.8rem] text-center group hover:border-primary/20 transition-all">
            <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1.5 italic transition-colors group-hover:text-primary/40">{label}</div>
            <div className="text-xs font-black italic tracking-tighter text-foreground/80">{value}</div>
        </div>
    );
}

function OHLC_Item({ label, value }: any) {
    return (
        <div className="text-center group">
            <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] mb-1.5 italic group-hover:text-primary/40 transition-colors">{label}</div>
            <div className="text-sm font-black italic tracking-tighter text-foreground/80 font-mono">${value}</div>
        </div>
    );
}
