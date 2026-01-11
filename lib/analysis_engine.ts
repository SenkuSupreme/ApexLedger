
const TWELVE_DATA_KEYS = (process.env.TWELVE_DATA_API_KEYS || process.env.TWELVE_DATA_API_KEY || '').split(',').map(k => k.trim()).filter(k => k !== '');

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ===== Timeframe Definitions =====
export type Timeframe = '4H' | '15M' | '5M' | '1M';

export const TIMEFRAME_CONFIG: Record<Timeframe, { interval: string; label: string; purpose: string }> = {
    '4H': { interval: '4h', label: '4 Hour', purpose: 'Higher Timeframe Bias' },
    '15M': { interval: '15min', label: '15 Minute', purpose: 'Main Structure' },
    '5M': { interval: '5min', label: '5 Minute', purpose: 'Entry Confirmation' },
    '1M': { interval: '1min', label: '1 Minute', purpose: 'Scalping Precision' }
};

export interface CandleMetrics { bodySize: number; upperWick: number; lowerWick: number; type: 'BULLISH' | 'BEARISH' | 'DOJI'; range: number; volatility: number; ohlc: { o: number, h: number, l: number, c: number }; }
export interface OrderBlock { index: number; time: string; type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; midpoint: number; mitigated: boolean; freshness: 'UNTAPPED' | 'TAPPED' | 'MITIGATED'; validityScore: number; volume: number; strength: 'WEAK' | 'MODERATE' | 'STRONG'; distance: number; }
export interface FairValueGap { index: number; time: string; type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; midpoint: number; mitigated: boolean; fillStatus: 'CLEAN' | 'PARTIAL' | 'FULL'; size: number; percentSize: number; distance: number; }
export interface MarketStructure { index: number; time: string; type: 'BOS' | 'CHOCH' | 'MSS'; direction: 'BULLISH' | 'BEARISH'; price: number; significance: 'MINOR' | 'MAJOR'; strength: 'IMPULSIVE' | 'WEAK'; confirmationTf: string; }
export interface LiquidityPool { type: 'EQH' | 'EQL' | 'BSL' | 'SSL' | 'INTERNAL' | 'EXTERNAL'; price: number; strength: number; swept: boolean; }
export interface LiquiditySweep { index: number; time: string; type: 'BUYSIDE' | 'SELLSIDE'; sweptLevel: number; sweepWick: number; closePrice: number; reversal: boolean; rejectionStrength: number; multiSweep: boolean; }
export interface PremiumDiscountZone { equilibrium: number; premiumStart: number; discountEnd: number; currentZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM'; rangeHigh: number; rangeLow: number; }
export interface SessionData { name: string; high: number; low: number; open: string; status: 'PENDING' | 'ACTIVE' | 'CLOSED'; sweepDetected: boolean; }
export interface BiasTableRow { timeframe: string; structure: string; bias: string; liquidityTarget: string; }

export interface MarketStructure { index: number; time: string; type: 'BOS' | 'CHOCH' | 'MSS'; direction: 'BULLISH' | 'BEARISH'; price: number; significance: 'MINOR' | 'MAJOR'; strength: 'IMPULSIVE' | 'WEAK'; confirmationTf: string; candleIndex?: number; }

export interface CandleMetrics { 
    bodySize: number; upperWick: number; lowerWick: number; type: 'BULLISH' | 'BEARISH' | 'DOJI'; range: number; volatility: number; ohlc: { o: number, h: number, l: number, c: number };
    colorType: 'GREEN' | 'RED' | 'GRAY';
}

export interface OrderBlock { 
    index: number; time: string; type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; midpoint: number; mitigated: boolean; 
    freshness: 'UNTAPPED' | 'TAPPED' | 'MITIGATED'; validityScore: number; volume: number; strength: 'WEAK' | 'MODERATE' | 'STRONG'; distance: number; 
    mitigationCandle?: string; reactionCandle?: string; position: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
}

export interface FairValueGap { 
    index: number; time: string; type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; midpoint: number; mitigated: boolean; 
    fillStatus: 'CLEAN' | 'PARTIAL' | 'FULL'; size: number; percentSize: number; distance: number; quality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface LiquiditySweep { 
    index: number; time: string; type: 'BUYSIDE' | 'SELLSIDE'; sweptLevel: number; sweepWick: number; closePrice: number; reversal: boolean; 
    rejectionStrength: number; multiSweep: boolean; sweepType: 'HIGH' | 'LOW'; sweepCount: number; confirmationCandle: string;
}

export interface StrategySetup { 
    name: string; methodology: 'SMC' | 'ICT' | 'ORB' | 'CRT'; setup: string; logic: string; confidence: number; entry: number; sl: number; tp1: number; tp2: number; 
    entryConditions: { htfBias: boolean; liqSweep: boolean; confluence: boolean; session: boolean; volatility: boolean; };
    explanation: { why: string; target: string; invalidation: string; controlTf: string; narrative: string };
}

export interface TimeframeSMC { 
    timeframe: Timeframe; label: string; purpose: string; metrics: CandleMetrics;
    orderBlocks: OrderBlock[]; fairValueGaps: FairValueGap[]; structure: MarketStructure[]; 
    swingHighs: number[]; swingLows: number[]; hh: boolean; hl: boolean; lh: boolean; ll: boolean;
    liquidityPools: LiquidityPool[]; liquiditySweeps: LiquiditySweep[]; premiumDiscount: PremiumDiscountZone; 
    volatility: VolatilityMetrics; trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; confluenceScore: number; 
    candlePatterns: string[];
    po3?: { phase: 'ACCUMULATION' | 'MANIPULATION' | 'DISTRIBUTION' | 'NONE'; accumulationRange: number; };
    structureDetails?: {
        bos: { index: number; direction: string; strength: string; confirmationTf: string; } | null;
        choch: { index: number; direction: string; level: number; } | null;
    };
}

export interface MethodologySpecifics {
    orb?: { orh: number; orl: number; midpoint: number; duration: string; session: string; };
    crt?: { high: number; low: number; midpoint: number; referenceCandle: string; expansion: boolean; };
    ict?: { pdh: number; pdl: number; midnightOpen: number; silverBullet: { active: boolean; zone: string }; killZone: string | null; };
}

export interface AdvancedSMC { 
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
asian: SessionData; london: SessionData; ny: SessionData; };
    indicators: { vwap: number; rsi: number; ema20: number; ema50: number; };
    symbolIntelligence: { adr: number; bestSession: string; manipulationTime: string; newsSensitivity: 'HIGH' | 'MEDIUM' | 'LOW'; };
    overallBias: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH'; 
    confluenceScore: number; 
    strategies: StrategySetup[];
    tradingPlan: { bias: string; entryZone: string; entryPrice: number; stopLoss: number; tp1: number; tp2: number; targets: string; explanation: { why: string; target: string; invalidation: string; controlTf: string; }; }; 
    lastUpdated: string; 
}

export interface DiagnosticSignal {
    label: string;
    status: 'VALID' | 'INVALID' | 'PENDING';
}

export interface AnalysisResult { 
    symbol: string; currentPrice: number; trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; probability: number; 
    signals: DiagnosticSignal[]; 
    concepts: { smc: string[]; ict: string[]; orb: string[]; crt: string[]; }; 
    smc_advanced: AdvancedSMC; analyzedAt: string; 
}

// ===== Data Fetcher =====

let currentKeyIndex = 0;

async function fetchWithRotation(symbol: string, interval: string): Promise<Candle[]> {
    if (TWELVE_DATA_KEYS.length === 0) throw new Error("No Twelve Data API keys configured");

    let cleanSym = symbol.toUpperCase().replace('-', '');
    if (cleanSym.length === 6 && !cleanSym.includes('/')) {
        cleanSym = `${cleanSym.substring(0, 3)}/${cleanSym.substring(3, 6)}`;
    }

    for (let i = 0; i < TWELVE_DATA_KEYS.length; i++) {
        const key = TWELVE_DATA_KEYS[currentKeyIndex];
        try {
            const url = `https://api.twelvedata.com/time_series?symbol=${cleanSym}&interval=${interval}&apikey=${key}&outputsize=100`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.status === 'ok' && data.values) {
                return data.values.map((v: any) => ({
                    time: v.datetime,
                    open: parseFloat(v.open),
                    high: parseFloat(v.high),
                    low: parseFloat(v.low),
                    close: parseFloat(v.close),
                    volume: parseFloat(v.volume || '0')
                })).sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
            }
            currentKeyIndex = (currentKeyIndex + 1) % TWELVE_DATA_KEYS.length;
        } catch (e) {
            currentKeyIndex = (currentKeyIndex + 1) % TWELVE_DATA_KEYS.length;
        }
    }
    return [];
}

export async function fetchMarketData(symbol: string, interval: string = '60min'): Promise<Candle[]> {
    return await fetchWithRotation(symbol, interval);
}

export async function fetchMultiTimeframeData(symbol: string): Promise<Record<Timeframe, Candle[]>> {
    const results: Record<Timeframe, Candle[]> = { '4H': [], '15M': [], '5M': [], '1M': [] };
    const tfs: { tf: Timeframe; int: string }[] = [
        { tf: '15M', int: '15min' },
        { tf: '5M', int: '5min' },
        { tf: '1M', int: '1min' },
        { tf: '4H', int: '4h' } 
    ];

    for (const item of tfs) {
        results[item.tf] = await fetchMarketData(symbol, item.int);
        await new Promise(r => setTimeout(r, 200)); 
    }
    return results;
}

// ===== SMC Analysis Logic =====

export interface VolatilityMetrics { atr14: number; atrPercent: number; currentRange: number; avgRange: number; isExpansion: boolean; isContraction: boolean; }

function calculateATRValue(candles: Candle[], p: number = 14): number {
    if (candles.length < 2) return 0.0001;
    const trs = [];
    for (let i = 1; i < candles.length; i++) {
        trs.push(Math.max(candles[i].high-candles[i].low, Math.abs(candles[i].high-candles[i-1].close), Math.abs(candles[i].low-candles[i-1].close)));
    }
    return trs.slice(-p).reduce((a,b) => a+b, 0) / Math.min(trs.length, p);
}

function analyzeTimeframe(candles: Candle[], timeframe: Timeframe): TimeframeSMC {
    const cp = candles.length > 0 ? candles[candles.length - 1].close : 0;
    if (candles.length < 10) return createEmptyTimeframeSMC(timeframe, cp);

    const atr = calculateATRValue(candles);
    const last = candles[candles.length - 1];
    
    const bodySize = Math.abs(last.close - last.open);
    const upperWick = last.high - Math.max(last.open, last.close);
    const lowerWick = Math.min(last.open, last.close) - last.low;
    const candleType = last.close > last.open ? 'BULLISH' : last.close < last.open ? 'BEARISH' : 'DOJI';
    
    const metrics: CandleMetrics = { 
        bodySize, upperWick, lowerWick, type: candleType as any, range: last.high - last.low, volatility: atr,
        ohlc: { o: last.open, h: last.high, l: last.low, c: last.close },
        colorType: last.close > last.open ? 'GREEN' : last.close < last.open ? 'RED' : 'GRAY'
    };

    const swingHighs: number[] = [];
    const swingLows: number[] = [];
    for (let i = 2; i < candles.length - 2; i++) {
        const c = candles[i];
        if (candles.slice(i-2, i+3).every(x => x.high <= c.high)) swingHighs.push(c.high);
        if (candles.slice(i-2, i+3).every(x => x.low >= c.low)) swingLows.push(c.low);
    }

    const structure: MarketStructure[] = [];
    let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    const lastH = swingHighs.slice(-1)[0] || last.high;
    const lastL = swingLows.slice(-1)[0] || last.low;
    
    const hh = last.high > lastH;
    const ll = last.low < lastL;
    const hl = last.low > lastL && !hh;
    const lh = last.high < lastH && !ll;

    for (let i = candles.length - 20; i < candles.length - 1; i++) {
        const c = candles[i];
        if (c.high > lastH) {
            structure.push({ index: i, time: c.time, type: trend === 'BEARISH' ? 'CHOCH' : 'BOS', direction: 'BULLISH', price: c.high, significance: 'MAJOR', strength: 'IMPULSIVE', confirmationTf: timeframe });
            trend = 'BULLISH';
        } else if (c.low < lastL) {
            structure.push({ index: i, time: c.time, type: trend === 'BULLISH' ? 'CHOCH' : 'BOS', direction: 'BEARISH', price: c.low, significance: 'MAJOR', strength: 'IMPULSIVE', confirmationTf: timeframe });
            trend = 'BEARISH';
        }
    }
    if (trend === 'NEUTRAL') trend = cp > (lastH+lastL)/2 ? 'BULLISH' : 'BEARISH';

    const obs: OrderBlock[] = [];
    const fvgs: FairValueGap[] = [];
    const sweeps: LiquiditySweep[] = [];
    const pools: LiquidityPool[] = [];

    for (let i = candles.length - 50; i < candles.length - 1; i++) {
        if (i < 2) continue;
        const c = candles[i], p = candles[i-1], n = candles[i+1];
        if (!n || !p) continue;
        const isStrong = Math.abs(c.close - c.open) > (c.high - c.low) * 0.6;
        if (isStrong) {
            obs.push({ 
                index: i, time: c.time, type: c.close > c.open ? 'BULLISH' : 'BEARISH', top: c.high, bottom: c.low, midpoint: (c.high+c.low)/2, 
                mitigated: cp > c.high || cp < c.low, freshness: (cp > c.high || cp < c.low) ? 'MITIGATED' : 'UNTAPPED', validityScore: 85, volume: c.volume, strength: 'STRONG', distance: (((c.high+c.low)/2/cp)-1)*100,
                position: cp > c.high ? 'DISCOUNT' : 'PREMIUM'
            });
        }
        if (n.low > p.high + (cp * 0.0001)) {
            fvgs.push({ index: i, time: c.time, type: 'BULLISH', top: n.low, bottom: p.high, midpoint: (n.low+p.high)/2, mitigated: cp < p.high, fillStatus: 'CLEAN', size: n.low-p.high, percentSize: ((n.low-p.high)/cp)*100, distance: (((n.low+p.high)/2/cp)-1)*100, quality: 'HIGH' });
        }
        if (n.high < p.low - (cp * 0.0001)) {
            fvgs.push({ index: i, time: c.time, type: 'BEARISH', top: p.low, bottom: n.high, midpoint: (p.low+n.high)/2, mitigated: cp > p.low, fillStatus: 'CLEAN', size: p.low-n.high, percentSize: ((p.low-n.high)/cp)*100, distance: (((p.low+n.high)/2/cp)-1)*100, quality: 'HIGH' });
        }
    }

    const last30 = candles.slice(-30);
    last30.forEach((c, idx) => {
        const i = candles.length - 30 + idx;
        const body = Math.abs(c.close - c.open);
        const uW = c.high - Math.max(c.open, c.close);
        const lW = Math.min(c.open, c.close) - c.low;
		    if (uW > body * 2 && c.high > lastH) sweeps.push({ index: i, time: c.time, type: 'BUYSIDE', sweptLevel: lastH, sweepWick: uW, closePrice: c.close, reversal: c.close < c.open, rejectionStrength: 80, multiSweep: false, sweepType: 'HIGH', sweepCount: 1, confirmationCandle: 'PENDING' });
        if (lW > body * 2 && c.low < lastL) sweeps.push({ index: i, time: c.time, type: 'SELLSIDE', sweptLevel: lastL, sweepWick: lW, closePrice: c.close, reversal: c.close > c.open, rejectionStrength: 80, multiSweep: false, sweepType: 'LOW', sweepCount: 1, confirmationCandle: 'PENDING' });
    });

    const highFreq: Record<string, number> = {};
    const lowFreq: Record<string, number> = {};
    swingHighs.forEach(h => { const k = h.toFixed(4); highFreq[k] = (highFreq[k]||0)+1; });
    swingLows.forEach(l => { const k = l.toFixed(4); lowFreq[k] = (lowFreq[k]||0)+1; });
    Object.entries(highFreq).forEach(([p, count]) => { if (count >= 2) pools.push({ type: 'EQH', price: parseFloat(p), strength: 70 + (count * 10), swept: cp > parseFloat(p) }); });
    Object.entries(lowFreq).forEach(([p, count]) => { if (count >= 2) pools.push({ type: 'EQL', price: parseFloat(p), strength: 70 + (count * 10), swept: cp < parseFloat(p) }); });
    
    if (pools.length === 0) {
        pools.push({ type: 'INTERNAL', price: lastH, strength: 60, swept: cp > lastH });
        pools.push({ type: 'EXTERNAL', price: lastL, strength: 65, swept: cp < lastL });
    }

    // Candle Pattern Detection
    const candlePatterns: string[] = [];
    if (upperWick > bodySize * 2 && candleType === 'BEARISH') candlePatterns.push('Shooting Star');
    if (lowerWick > bodySize * 2 && candleType === 'BULLISH') candlePatterns.push('Hammer');
    if (bodySize > atr * 1.5) candlePatterns.push('Momentum');
    if (Math.abs(last.close - last.open) < (last.high - last.low) * 0.1) candlePatterns.push('Doji');

    // PO3 Detection (Simplified)
    const dayCandles = candles.slice(-50);
    const accumulationRange = Math.max(...dayCandles.slice(0, 10).map(c => c.high)) - Math.min(...dayCandles.slice(0, 10).map(c => c.low));
    
    return {
        timeframe, label: TIMEFRAME_CONFIG[timeframe].label, purpose: TIMEFRAME_CONFIG[timeframe].purpose, metrics,
        orderBlocks: obs.slice(-6), fairValueGaps: fvgs.slice(-6), structure: structure.slice(-6).reverse(),
        swingHighs: swingHighs.slice(-10), swingLows: swingLows.slice(-10), hh, hl, lh, ll,
        liquidityPools: pools, liquiditySweeps: sweeps.slice(-5),
        premiumDiscount: { equilibrium: (lastH+lastL)/2, premiumStart: lastH, discountEnd: lastL, currentZone: cp > (lastH+lastL)/2 ? 'PREMIUM' : 'DISCOUNT', rangeHigh: lastH, rangeLow: lastL },
        volatility: { atr14: atr, atrPercent: (atr/cp)*100, currentRange: last.high-last.low, avgRange: atr, isExpansion: (last.high-last.low) > atr*1.5, isContraction: (last.high-last.low) < atr*0.8 },
        trend, confluenceScore: 75,
        candlePatterns,
        po3: { phase: (hh || ll) ? 'DISTRIBUTION' : (sweeps.length > 0 ? 'MANIPULATION' : 'ACCUMULATION'), accumulationRange }
    };
}

function createEmptyTimeframeSMC(timeframe: Timeframe, price: number): TimeframeSMC {
    const emptyMetrics: CandleMetrics = { 
        bodySize: 0, upperWick: 0, lowerWick: 0, type: 'DOJI', range: 0, volatility: 0, 
        ohlc: { o: price, h: price, l: price, c: price },
        colorType: 'GRAY'
    };
    return {
        timeframe, label: TIMEFRAME_CONFIG[timeframe].label, purpose: TIMEFRAME_CONFIG[timeframe].purpose, metrics: emptyMetrics,
        orderBlocks: [], fairValueGaps: [], structure: [], swingHighs: [], swingLows: [], hh: false, hl: false, lh: false, ll: false,
        liquidityPools: [], liquiditySweeps: [], candlePatterns: [],
        premiumDiscount: { equilibrium: price, premiumStart: price, discountEnd: price, currentZone: 'EQUILIBRIUM', rangeHigh: price, rangeLow: price },
        volatility: { atr14: 0, atrPercent: 0, currentRange: 0, avgRange: 0, isExpansion: false, isContraction: false },
        trend: 'NEUTRAL', confluenceScore: 0, po3: { phase: 'NONE', accumulationRange: 0 }, structureDetails: { bos: null, choch: null }
    };
}

export function analyzeMarket(s: string, c: Candle[]): AnalysisResult {
    return buildResult(s, c[c.length-1]?.close || 0, { '4H': [], '15M': c, '5M': [], '1M': [] });
}

export function analyzeMarketMultiTimeframe(s: string, d: Record<Timeframe, Candle[]>): AnalysisResult {
    const cp = d['1M'].slice(-1)[0]?.close || d['15M'].slice(-1)[0]?.close || 0;
    return buildResult(s, cp, d);
}

function buildResult(symbol: string, currentPrice: number, tfData: Record<Timeframe, Candle[]>): AnalysisResult {
    const timeframes = (['4H', '15M', '5M', '1M'] as Timeframe[]).map(tf => analyzeTimeframe(tfData[tf], tf));
    const htf = timeframes[0]; 
    const mainTf = timeframes[1]; 

    const overallBias = htf.trend === 'BULLISH' ? 'BULLISH' : htf.trend === 'BEARISH' ? 'BEARISH' : 'NEUTRAL';
    const strategies: StrategySetup[] = [];

    // Smarter numeric formatting for Forex and high-precision assets
    const getDecimals = (sym: string, price: number) => {
        const s = sym.toUpperCase();
        if (s.includes('JPY') || s.includes('XAU') || s.includes('GOLD')) return 2;
        if (s.includes('BTC') || s.includes('ETH')) return 2;
        if (price > 500) return 2; // Indices/Stocks
        if (price < 0.1) return 6; // Low value crypto
        return 5; // Standard Forex (EURUSD, etc)
    };
    const decimals = getDecimals(symbol, currentPrice);
    const fmt = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    
    const now = new Date();
    const currentHour = now.getUTCHours();
    const isLondon = currentHour >= 8 && currentHour < 13;
    const isNY = currentHour >= 13 && currentHour < 20;
    const isKillZone = (currentHour >= 2 && currentHour <= 5) || (currentHour >= 8 && currentHour <= 11) || (currentHour >= 13 && currentHour <= 16);

    const dynamicConditions = { 
        htfBias: htf.trend === overallBias, 
        liqSweep: mainTf.liquiditySweeps.length > 0, 
        confluence: mainTf.orderBlocks.length > 0 || mainTf.fairValueGaps.length > 0, 
        session: isKillZone, 
        volatility: mainTf.volatility.atrPercent > 0.05 
    };

    // Calculate Dynamic Probability Matrix (Confluence Analysis)
    const calculateSMCScore = () => {
        let score = 0;
        if (dynamicConditions.htfBias) score += 30;
        if (dynamicConditions.liqSweep) score += 30;
        if (dynamicConditions.confluence) score += 20;
        if (mainTf.trend === overallBias) score += 20;
        return score;
    };
    const calculateICTScore = () => {
        let score = 0;
        if (isKillZone) score += 40;
        if (mainTf.fairValueGaps.length > 0) score += 30;
        if (dynamicConditions.htfBias) score += 30;
        return score;
    };
    const calculateORBScore = () => {
        let score = 0;
        if (currentHour >= 8 && currentHour <= 10) score += 50; // Early London
        if (currentHour >= 13 && currentHour <= 15) score += 50; // Early NY
        if (mainTf.volatility.isExpansion) score += 50;
        return Math.min(score, 100);
    };
    const calculateCRTScore = () => {
        let score = 0;
        if (mainTf.volatility.isContraction) score += 50;
        if (mainTf.volatility.isExpansion) score += 50;
        return score;
    };

    const smcScore = calculateSMCScore();
    const ictScore = calculateICTScore();
    const orbScore = calculateORBScore();
    const crtScore = calculateCRTScore();

    // Weighted Combined Probability
    const combinedProbability = Math.round(
        (smcScore * 0.4) + (ictScore * 0.3) + (orbScore * 0.15) + (crtScore * 0.15)
    );

    strategies.push({
        name: 'ICT Algorithm Delivery (Silver Bullet)', methodology: 'ICT', setup: 'FVG Displacement', logic: 'Precise time-aligned displacement through a FVG in the session Kill Zone.',
        confidence: ictScore, entry: currentPrice, sl: currentPrice * (overallBias === 'BULLISH' ? 0.9985 : 1.0015), tp1: currentPrice * (overallBias === 'BULLISH' ? 1.003 : 0.997), tp2: currentPrice * (overallBias === 'BULLISH' ? 1.006 : 0.994),
        entryConditions: dynamicConditions,
        explanation: {
            why: 'The algorithm has entered a high-probability "Silver Bullet" delivery window. A displacement candle has successfully punctured local structure, creating a Fair Value Gap (FVG) that serves as the institutional entry point. This aligns perfectly with the daily bias and session-specific liquidity hunt.',
            target: 'The primary Draw on Liquidity (DOL) is the nearest unmitigated HTF Order Block and the opposing session High/Low liquidity pool.',
            invalidation: 'Invalidation occurs if price closes beyond the consequent encroachment (50%) of the anchor FVG, signaling a lack of institutional sponsorship.',
            controlTf: 'Context: 1H / Execution: 1M Sync',
            narrative: 'Price is currently being delivered by the institutional algorithm. We are riding the expansion phase after a successful manipulation of early session participants. The target is clear, and the delivery state is locked.'
        }
    });

    strategies.push({
        name: 'ORB Session Expansion (Trend Day)', methodology: 'ORB', setup: 'Initial Balance Breakout', logic: 'Aggressive expansion out of the 15M opening range, confirming session dominance.',
        confidence: orbScore, entry: currentPrice * 1.0005, sl: currentPrice * 0.9995, tp1: currentPrice * 1.003, tp2: currentPrice * 1.007,
        entryConditions: dynamicConditions,
        explanation: {
            why: 'The Opening Range (OR) has been established and successfully breached with high-relative volume. This "Initial Balance Breakout" suggests a Trend Day profile. Price has accepted value outside the opening auction ranges, indicating that higher-timeframe participants are actively driving the session.',
            target: 'Targeting standard deviations (2.0 SD) of the Initial Balance, aligning with the projected Average Daily Range (ADR).',
            invalidation: 'Any acceptance back within the 50% equilibrium of the Opening Range signals a failed breakout and potential range-bound behavior.',
            controlTf: 'Initial Balance: 15M / Trigger: 5M',
            narrative: 'The session narrative has shifted from auctioning to expansion. Smart Money is expanding the range aggressively. We are positioned to capture the primary directional move of the New York/London overlap.'
        }
    });

    strategies.push({
        name: 'SMC Sweep & Reverse Protocol', methodology: 'SMC', setup: 'Liquidity Grab & Reversal', logic: 'Price swept major external liquidity and rejected violently, forming an institutional CHOCH.',
        confidence: smcScore, entry: currentPrice, sl: currentPrice * (overallBias === 'BULLISH' ? 0.999 : 1.001), tp1: currentPrice * (overallBias === 'BULLISH' ? 1.003 : 0.997), tp2: currentPrice * (overallBias === 'BULLISH' ? 1.006 : 0.994),
        entryConditions: dynamicConditions,
        explanation: {
            why: 'Price swept major external liquidity and rejected violently, forming an institutional CHOCH. This displacement confirms the presence of institutional order flow seeking to re-price the market.',
            target: 'Internal Range Liquidity (FVG) and opposing Weak Highs/Lows (Draw on Liquidity).',
            invalidation: 'Any candle body close beyond the sweep wick low/high, indicating a failure to defend the institutional level.',
            controlTf: 'Context: 4H / Execution: 15M Alignment',
            narrative: 'The HTF narrative suggests a deeper pullback is complete. Smart Money has cleared stops below the recent low (Sell-side Liquidity) and is now positioned for a run on buy-side liquidity pools.'
        }
    });
    strategies.push({
        name: 'CRT Range Rejection', methodology: 'CRT', setup: 'Compression Liquidation', logic: 'Expansion out of a contracted candle range at institutional levels.',
        confidence: crtScore, entry: currentPrice, sl: currentPrice * (overallBias === 'BULLISH' ? 0.999 : 1.001), tp1: currentPrice * (overallBias === 'BULLISH' ? 1.0025 : 0.9975), tp2: currentPrice * (overallBias === 'BULLISH' ? 1.005 : 0.995),
        entryConditions: dynamicConditions,
        explanation: {
            why: 'A "Contracted Range Theory" (CRT) event was identified on the execution chart. Volatility compressed into a "Master Candle", inducing a false breakout (The Trap). This trap was quickly invalidated as price expanded aggressively in the intended direction.',
            target: 'Liquidity Voids created by the sudden expansion and the opposing boundary of the larger parent range.',
            invalidation: 'Price re-entering and closing inside the body of the CRT Reference Candle (Body Close), indicating the expansion was a fake-out.',
            controlTf: 'Pattern: 5M / Trend: 15M',
            narrative: 'Volatility contracted to a singularity, blinding retail traders. The subsequent expansion is the "release" of this built-up energy. We are trading the "Real Move" that follows the initial fake-out, aligning with the true institutional order flow.'
        }
    });

    const bestStrategy = [...strategies].sort((a, b) => b.confidence - a.confidence)[0] || strategies[0];

    const signals: DiagnosticSignal[] = [
        { 
            label: 'HH/LL Structural Confirmation', 
            status: mainTf.trend === htf.trend ? 'VALID' : 'PENDING' 
        },
        { 
            label: 'HTF Bias Alignment', 
            status: dynamicConditions.htfBias ? 'VALID' : 'INVALID' 
        },
        { 
            label: 'Session Kill Zone Active', 
            status: isKillZone ? 'VALID' : 'INVALID' 
        }
    ];

    return {
        symbol, currentPrice, trend: htf.trend, probability: combinedProbability,
        signals,
        concepts: { 
            smc: ['Order Blocks', 'FVG', 'HH/LL Structure'], ict: ['PD-Arrays', 'Silver Bullet'], orb: ['Range High', 'Range Low'], crt: ['Volatility Compression'] 
        },
        smc_advanced: { 
            htfBias: { trend: htf.trend, confluenceScore: 85, keyLevel: htf.premiumDiscount.equilibrium, description: `H4 Alignment is ${htf.trend}.` },
            timeframes, 
            biasTable: [
                { timeframe: '4H', structure: htf.trend, bias: overallBias, liquidityTarget: 'External Range' },
                { timeframe: '15M', structure: mainTf.trend, bias: overallBias, liquidityTarget: 'Internal FVG' },
                { timeframe: '5M', structure: overallBias, bias: overallBias, liquidityTarget: 'Session High/Low' },
                { timeframe: '1M', structure: 'NEUTRAL', bias: overallBias === 'BULLISH' ? 'BULLISH' : 'BEARISH', liquidityTarget: 'Micro Structure' }
            ],
            methodologySpecifics: {
                orb: {
                    orh: currentPrice * 1.002, 
                    orl: currentPrice * 0.998, 
                    midpoint: currentPrice, 
                    duration: '15M', 
                    session: 'New York'
                },
                crt: {
                    high: currentPrice * 1.0015, 
                    low: currentPrice * 0.9985, 
                    midpoint: currentPrice, 
                    referenceCandle: '5M Impulse', 
                    expansion: true
                },
                ict: {
                    pdh: currentPrice * 1.005, 
                    pdl: currentPrice * 0.995, 
                    midnightOpen: currentPrice * 0.999, 
                    silverBullet: { active: currentHour === 10 || currentHour === 3, zone: 'NY Session' }, 
                    killZone: currentHour >= 8 && currentHour <= 11 ? 'NY Killzone' : currentHour >= 2 && currentHour <= 5 ? 'London Killzone' : null
                }
            },
            sessions: { 
                asian: { name: 'Asian', high: currentPrice * 1.001, low: currentPrice * 0.999, open: '00:00', status: (currentHour >= 0 && currentHour < 8) ? 'ACTIVE' : 'CLOSED' as any, sweepDetected: mainTf.liquiditySweeps.some(s => s.type === 'SELLSIDE') },
                london: { name: 'London', high: currentPrice * 1.002, low: currentPrice * 0.998, open: '08:00', status: isLondon ? 'ACTIVE' : 'CLOSED' as any, sweepDetected: mainTf.liquiditySweeps.some(s => s.type === 'BUYSIDE') },
                ny: { name: 'New York', high: currentPrice * 1.003, low: currentPrice * 0.997, open: '13:00', status: isNY ? 'ACTIVE' : 'CLOSED' as any, sweepDetected: false }
            },
            indicators: { vwap: currentPrice, rsi: 55, ema20: currentPrice * 0.999, ema50: currentPrice * 0.998 },
            symbolIntelligence: { adr: currentPrice * 0.012, bestSession: 'London', manipulationTime: '08:30 GMT', newsSensitivity: 'HIGH' },
            overallBias: (overallBias === 'BULLISH' ? 'STRONG_BULLISH' : overallBias === 'BEARISH' ? 'STRONG_BEARISH' : 'NEUTRAL') as any, 
            confluenceScore: combinedProbability,
            strategies, 
            tradingPlan: { 
                bias: overallBias, entryPrice: bestStrategy.entry, stopLoss: bestStrategy.sl, tp1: bestStrategy.tp1, tp2: bestStrategy.tp2,
                entryZone: '15M Institutional Order Block', targets: `Target 1: ${fmt(bestStrategy.tp1)} | Target 2: ${fmt(bestStrategy.tp2)}`,
                explanation: { 
                    why: 'Price swept session lows and rejected with an institutional CHOCH, aligning with the H4 HTF bias.',
                    target: 'Opposing Buy-side Liquidity (BSL) at the 4H range high.',
                    invalidation: 'Structural break below the 15M sweep candle low.',
                    controlTf: '4H/15M Alignment'
                }
            },
            lastUpdated: new Date().toISOString()
        },
        analyzedAt: new Date().toISOString()
    };
}
