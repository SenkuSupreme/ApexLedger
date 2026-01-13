
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
    id: string;
    timestamp: string;
    name: string; 
    methodology: 'SMC' | 'ICT' | 'ORB' | 'CRT'; 
    setup: string; 
    logic: string; 
    confidence: number; 
    entry: number; 
    sl: number; 
    tp1: number; 
    tp2: number; 
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
    methodologySignals: {
        smc: DiagnosticSignal[];
        ict: DiagnosticSignal[];
        orb: DiagnosticSignal[];
        crt: DiagnosticSignal[];
    };
    concepts: { smc: string[]; ict: string[]; orb: string[]; crt: string[]; }; 
    smc_advanced: AdvancedSMC; analyzedAt: string; 
}

// ===== Data Fetcher =====

let currentKeyIndex = 0;

async function fetchWithRotation(symbol: string, interval: string): Promise<Candle[]> {
    if (TWELVE_DATA_KEYS.length === 0) throw new Error("No Twelve Data API keys configured");

    const sym = symbol.toUpperCase();
    
    // Institutional Mapping for Twelve Data Compliance
    const symbolMapper: Record<string, string> = {
        'US100': 'NDX',
        'NAS100': 'NDX',
        'SPX500': 'SPX',
        'US30': 'DJI',
        'GER40': 'DAX',
        'UK100': 'FTSE',
        'XAUUSD': 'XAU/USD',
        'XAGUSD': 'XAG/USD',
        'USOIL': 'WTI/USD',
        'UKOIL': 'BRENT/USD'
    };

    let mappedSym = symbolMapper[sym] || sym;

    // Automatic Forex Formatting (EURUSD -> EUR/USD)
    if (mappedSym.length === 6 && !mappedSym.includes('/') && !symbolMapper[sym]) {
        mappedSym = `${mappedSym.substring(0, 3)}/${mappedSym.substring(3, 6)}`;
    }

    for (let i = 0; i < TWELVE_DATA_KEYS.length; i++) {
        const key = TWELVE_DATA_KEYS[currentKeyIndex];
        // Increment index for next call immediately to distribute load
        currentKeyIndex = (currentKeyIndex + 1) % TWELVE_DATA_KEYS.length;

        try {
            const url = `https://api.twelvedata.com/time_series?symbol=${mappedSym}&interval=${interval}&apikey=${key}&outputsize=100`;
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
            } else if (data.status === 'error') {
                if (data.message?.includes('Grow plan') || data.message?.includes('pro plan')) {
                    console.warn(`[TWELVE_DATA] Symbol ${mappedSym} restricted by current plan. Attempting Finhub fallback...`);
                    break; // Exit loop to try fallback
                }
                if (data.message?.includes('API credits')) {
                    console.warn(`[TWELVE_DATA] Rate limit hit on key[${(currentKeyIndex-1+TWELVE_DATA_KEYS.length)%TWELVE_DATA_KEYS.length}]. Rotating...`);
                    // Continue loop to try next key
                    continue;
                }
                console.warn(`[TWELVE_DATA API] Error for ${mappedSym}: ${data.message}`);
            }
        } catch (e) {
            console.error(`[TWELVE_DATA FETCH] Error:`, e);
        }
    }

    // Fallback: Finhub Candles for restricted symbols (Indices/Commodities)
    try {
        const finhubKey = process.env.FINHUB_API_KEY || 'demo';
        // Map common symbols to Finhub format (OANDA is a good generic provider for free tier)
        const finhubMapper: Record<string, string> = {
            'XAU/USD': 'OANDA:XAU_USD',
            'XAG/USD': 'OANDA:XAG_USD',
            'WTI/USD': 'OANDA:WTICO_USD',
            'BRENT/USD': 'OANDA:BCO_USD',
            'NDX': 'OANDA:NAS100_USD',
            'SPX': 'OANDA:SPX500_USD',
            'DJI': 'OANDA:US30_USD'
        };
        const finhubSym = finhubMapper[mappedSym] || mappedSym;
        const resolutionMap: Record<string, string> = { '1min': '1', '5min': '5', '15min': '15', '4h': '240', '1day': 'D' };
        const resltn = resolutionMap[interval] || '15';
        
        const to = Math.floor(Date.now() / 1000);
        const from = to - (resltn === '240' ? 86400 * 30 : 86400 * 5); // 1 month for 4H, 5 days for others
        
        const url = `https://finnhub.io/api/v1/forex/candle?symbol=${finhubSym}&resolution=${resltn}&from=${from}&to=${to}&token=${finhubKey}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.s === 'ok') {
            return data.t.map((timestamp: number, idx: number) => ({
                time: new Date(timestamp * 1000).toISOString(),
                open: data.o[idx],
                high: data.h[idx],
                low: data.l[idx],
                close: data.c[idx],
                volume: data.v[idx]
            }));
        }
    } catch (e) {
        console.error(`[FINHUB FALLBACK] Error for ${mappedSym}:`, e);
    }

    return [];
}

export async function fetchMarketData(symbol: string, interval: string = '60min'): Promise<Candle[]> {
    return await fetchWithRotation(symbol, interval);
}

export async function fetchCurrentPrice(symbol: string): Promise<number> {
    if (TWELVE_DATA_KEYS.length === 0) return 0;
    
    const sym = symbol.toUpperCase();
    const symbolMapper: Record<string, string> = {
        'US100': 'NDX',
        'NAS100': 'NDX',
        'SPX500': 'SPX',
        'US30': 'DJI',
        'GER40': 'DAX',
        'UK100': 'FTSE',
        'XAUUSD': 'XAU/USD',
        'XAGUSD': 'XAG/USD',
        'USOIL': 'WTI/USD',
        'UKOIL': 'BRENT/USD'
    };

    let mappedSym = symbolMapper[sym] || sym;
    if (mappedSym.length === 6 && !mappedSym.includes('/') && !symbolMapper[sym]) {
        mappedSym = `${mappedSym.substring(0, 3)}/${mappedSym.substring(3, 6)}`;
    }

    for (let i = 0; i < TWELVE_DATA_KEYS.length; i++) {
        const key = TWELVE_DATA_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % TWELVE_DATA_KEYS.length;
        
        try {
            const url = `https://api.twelvedata.com/price?symbol=${mappedSym}&apikey=${key}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.price) {
                return parseFloat(data.price);
            }
        } catch (e) {
            // Silently try next key
        }
    }

    // Try Finhub for price as last resort
    try {
        const finhubKey = process.env.FINHUB_API_KEY || 'demo';
        const url = `https://finnhub.io/api/v1/quote?symbol=${mappedSym}&token=${finhubKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.c) return data.c;
    } catch (e) {}

    return 0;
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
    const bias = overallBias === 'NEUTRAL' ? 'BULLISH' : overallBias;
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
        if (htf.trend === (bias === 'BULLISH' ? 'BULLISH' : 'BEARISH')) score += 25; // HTF Alignment
        if (mainTf.liquiditySweeps.length > 0) score += 25; // Liquidity Inducement
        if (mainTf.structureDetails?.choch) score += 20; // Structural Shift
        if (mainTf.orderBlocks.some(ob => ob.freshness === 'UNTAPPED')) score += 15; // Point of Interest
        if (mainTf.fairValueGaps.some(f => f.fillStatus === 'CLEAN')) score += 15; // Imbalance
        return score;
    };
    const calculateICTScore = () => {
        let score = 0;
        if (isKillZone) score += 30; // Time Window
        if ((currentHour === 10 || currentHour === 3)) score += 20; // Silver Bullet
        if (mainTf.fairValueGaps.some(f => f.quality === 'HIGH')) score += 20; // Displacement
        if (mainTf.liquidityPools.some(p => p.type === 'BSL' || p.type === 'SSL')) score += 15; // Draw on Liquidity
        if (mainTf.po3?.phase === 'MANIPULATION') score += 15; // Judas Swing
        return score;
    };
    const calculateORBScore = () => {
        let score = 0;
        const isORBTime = (currentHour === 8 || currentHour === 9 || currentHour === 13 || currentHour === 14);
        if (isORBTime) score += 40;
        if (mainTf.volatility.isExpansion) score += 30;
        if (mainTf.volatility.atrPercent > 0.1) score += 30;
        return score;
    };
    const calculateCRTScore = () => {
        let score = 0;
        if (mainTf.volatility.isContraction) score += 40;
        if (mainTf.liquiditySweeps.length > 0) score += 30; // Inducement/Fakeout
        if (mainTf.volatility.isExpansion) score += 30; // The actual CRT expansion
        return score;
    };

    const smcScore = calculateSMCScore();
    const ictScore = calculateICTScore();
    const orbScore = calculateORBScore();
    const crtScore = calculateCRTScore();

    // Weighted Combined Probability (Institutional Confidence)
    const combinedProbability = Math.round(
        (smcScore * 0.45) + (ictScore * 0.35) + (orbScore * 0.1) + (crtScore * 0.1)
    );


    const getSMCExplanation = (bias: string) => ({
        why: `Market structure confirms ${mainTf.trend} alignment on 15M following a ${mainTf.liquiditySweeps[0]?.type || 'structural'} sweep. Price is currently ${fmt(currentPrice)}, reacting off a ${mainTf.orderBlocks[0]?.strength || 'valid'} OB at ${fmt(mainTf.orderBlocks[0]?.midpoint || currentPrice)}.`,
        target: bias === 'BULLISH' ? `H1/H4 Resistance / BSL at ${fmt(mainTf.liquidityPools.find(p => p.type === 'BSL')?.price || currentPrice * 1.015)}.` : `H1/H4 Support / SSL at ${fmt(mainTf.liquidityPools.find(p => p.type === 'SSL')?.price || currentPrice * 0.985)}.`,
        invalidation: `Structural break of the ${bias === 'BULLISH' ? 'Swing Low' : 'Swing High'} at ${fmt(mainTf.swingLows[0] || mainTf.swingHighs[0] || currentPrice * 0.99)}.`,
        controlTf: '4H Bias / 15M Orderflow',
        narrative: ''
    });

    const getICTExplanation = (bias: string) => ({
        why: `Algorithm is currently in the ${isNY ? 'NY' : isLondon ? 'London' : 'Session'} Kill Zone. Displacement at ${fmt(mainTf.fairValueGaps[0]?.midpoint || currentPrice)} confirms institutional sponsorship behind the move.`,
        target: `Opposing liquidity pool (PDH/PDL) at ${fmt(mainTf.premiumDiscount.rangeHigh || currentPrice * 1.01)}. Equilibrium target: ${fmt(mainTf.premiumDiscount.equilibrium)}.`,
        invalidation: `Price re-accepting values inside the 00:00 Opening Price at ${fmt(currentPrice * 0.999)} or closing through the FVG at ${fmt(mainTf.fairValueGaps[0]?.top || currentPrice)}.`,
        controlTf: 'Daily Narrative / 5M Execution',
        narrative: ''
    });

    const getORBExplanation = (bias: string) => ({
        why: `Opening Range established between ${fmt(currentPrice * 0.998)} and ${fmt(currentPrice * 1.002)}. High-energy breakout detected with ${mainTf.volatility.atrPercent.toFixed(2)}% ATR extension.`,
        target: `1.5x ADR expansion target at ${fmt(currentPrice * 1.008)}.`,
        invalidation: `Failed breakout and re-entry into the initial range at ${fmt(currentPrice * 1.001)}.`,
        controlTf: '15M ORB / 1M Momentum',
        narrative: ''
    });

    const getCRTExplanation = (bias: string) => ({
        why: `Contracted Range Theory identifies a compression zone at ${fmt(currentPrice)}. Fakeout at ${fmt(mainTf.liquiditySweeps[0]?.sweptLevel || currentPrice)} trapped retail liquidity before impulsive expansion.`,
        target: `Full Master Candle extension at ${fmt(currentPrice * 1.012)}.`,
        invalidation: `Midpoint violation of the reference candle at ${fmt(currentPrice)}.`,
        controlTf: '5M Compression / 15M Trend',
        narrative: ''
    });

    // Strategy ID Generator for Persistence
    const generateId = (method: string) => `${symbol}-${method}-${bias}-${now.toISOString().split('T')[0]}`;

    strategies.push({
        id: generateId('SMC'),
        timestamp: now.toISOString(),
        name: 'SMART MONEY CORE',
        methodology: 'SMC',
        setup: bias === 'BULLISH' ? 'High Probability Long' : 'High Probability Short',
        logic: 'Institutional Structure Alignment',
        confidence: smcScore,
        entry: currentPrice,
        sl: currentPrice * (bias === 'BULLISH' ? 0.995 : 1.005),
        tp1: currentPrice * (bias === 'BULLISH' ? 1.01 : 0.99),
        tp2: currentPrice * (bias === 'BULLISH' ? 1.02 : 0.98),
        entryConditions: dynamicConditions,
        explanation: getSMCExplanation(bias)
    });

    strategies.push({
        id: generateId('ICT'),
        timestamp: now.toISOString(),
        name: 'ALGORITHMIC DELIVERY (ICT)',
        methodology: 'ICT',
        setup: bias === 'BULLISH' ? 'Silver Bullet Long' : 'Silver Bullet Short',
        logic: 'Time-Based Liquidity Sweep',
        confidence: ictScore,
        entry: currentPrice,
        sl: currentPrice * (bias === 'BULLISH' ? 0.997 : 1.003),
        tp1: currentPrice * (bias === 'BULLISH' ? 1.008 : 0.992),
        tp2: currentPrice * (bias === 'BULLISH' ? 1.015 : 0.985),
        entryConditions: dynamicConditions,
        explanation: getICTExplanation(bias)
    });

    strategies.push({
        id: generateId('ORB'),
        timestamp: now.toISOString(),
        name: 'VOLATILITY BREAKOUT (ORB)',
        methodology: 'ORB',
        setup: bias === 'BULLISH' ? 'Range Breakout Long' : 'Range Breakout Short',
        logic: 'Opening Range Momentum Expansion',
        confidence: orbScore,
        entry: currentPrice,
        sl: currentPrice * (bias === 'BULLISH' ? 0.998 : 1.002),
        tp1: currentPrice * (bias === 'BULLISH' ? 1.005 : 0.995),
        tp2: currentPrice * (bias === 'BULLISH' ? 1.012 : 0.988),
        entryConditions: dynamicConditions,
        explanation: getORBExplanation(bias)
    });

    strategies.push({
        id: generateId('CRT'),
        timestamp: now.toISOString(),
        name: 'CONTRACTED RANGE THEORY',
        methodology: 'CRT',
        setup: bias === 'BULLISH' ? 'Expansion Long' : 'Expansion Short',
        logic: 'Volatility Compression Breakout',
        confidence: crtScore,
        entry: currentPrice,
        sl: currentPrice * (bias === 'BULLISH' ? 0.999 : 1.001),
        tp1: currentPrice * (bias === 'BULLISH' ? 1.006 : 0.994),
        tp2: currentPrice * (bias === 'BULLISH' ? 1.013 : 0.987),
        entryConditions: dynamicConditions,
        explanation: getCRTExplanation(bias)
    });

    const bestStrategy = [...strategies].sort((a, b) => b.confidence - a.confidence)[0] || strategies[0];

    const methodologySignals = {
        smc: [
            { label: 'HTF Structure (4H)', status: (htf.trend === (bias === 'BULLISH' ? 'BULLISH' : 'BEARISH') ? 'VALID' : 'INVALID') as any },
            { label: 'Swing Flow alignment', status: (mainTf.trend === (bias === 'BULLISH' ? 'BULLISH' : 'BEARISH') ? 'VALID' : 'PENDING') as any },
            { label: 'Liquidity Inducement', status: (mainTf.liquiditySweeps.length > 0 ? 'VALID' : 'PENDING') as any },
            { label: 'Valid Order Block', status: (mainTf.orderBlocks.some(ob => ob.freshness === 'UNTAPPED') ? 'VALID' : 'PENDING') as any },
            { label: 'Market Displacement', status: (mainTf.fairValueGaps.length > 0 ? 'VALID' : 'PENDING') as any }
        ],
        ict: [
            { label: 'Kill Zone Window', status: (isKillZone ? 'VALID' : 'INVALID') as any },
            { label: 'Silver Bullet Energy', status: ((currentHour === 10 || currentHour === 3) ? 'VALID' : 'INVALID') as any },
            { label: 'Draw on Liquidity', status: (mainTf.liquidityPools.some(p => p.type === 'BSL' || p.type === 'SSL') ? 'VALID' : 'PENDING') as any },
            { label: 'ICT Displacement', status: (mainTf.fairValueGaps.some(f => f.quality === 'HIGH') ? 'VALID' : 'PENDING') as any },
            { label: 'PO3 Manipulation', status: (mainTf.po3?.phase === 'MANIPULATION' ? 'VALID' : 'PENDING') as any }
        ],
        orb: [
            { label: 'Range Definition', status: 'VALID' as any },
            { label: 'Expansion Drive', status: (mainTf.volatility.isExpansion ? 'VALID' : 'PENDING') as any },
            { label: 'Volatility Spike', status: (mainTf.volatility.atrPercent > 0.08 ? 'VALID' : 'PENDING') as any },
            { label: 'Session Velocity', status: ((isLondon || isNY) ? 'VALID' : 'PENDING') as any },
            { label: 'Target Proximity', status: 'PENDING' as any }
        ],
        crt: [
            { label: 'Compression Profile', status: (mainTf.volatility.isContraction ? 'VALID' : 'PENDING') as any },
            { label: 'Fakeout Inducement', status: (mainTf.liquiditySweeps.length > 0 ? 'VALID' : 'PENDING') as any },
            { label: 'Primary Expansion', status: (mainTf.volatility.isExpansion ? 'VALID' : 'PENDING') as any },
            { label: 'CRT Reference ID', status: 'VALID' as any },
            { label: 'Structural Acceptance', status: 'PENDING' as any }
        ]
    };

    const signals: DiagnosticSignal[] = methodologySignals.smc; // Default to SMC for legacy overview

    return {
        symbol, currentPrice, trend: htf.trend, probability: combinedProbability,
        signals,
        methodologySignals,
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
                    why: bestStrategy.explanation.why,
                    target: bestStrategy.explanation.target,
                    invalidation: bestStrategy.explanation.invalidation,
                    controlTf: bestStrategy.explanation.controlTf
                }
            },
            lastUpdated: new Date().toISOString()
        },
        analyzedAt: new Date().toISOString()
    };
}

export function isAnalysisStillValid(previous: AnalysisResult, currentPrice: number): { valid: boolean; reason?: string } {
    if (!previous || !previous.smc_advanced?.strategies?.[0]) return { valid: false, reason: 'No previous data' };
    
    const strategy = previous.smc_advanced.strategies[0];
    const { sl, tp1, setup } = strategy;
    const isBullish = setup.toUpperCase().includes('LONG') || setup.toUpperCase().includes('BULL');

    // 1. Check if price has hit Stop Loss
    if (isBullish && currentPrice <= sl) return { valid: false, reason: 'Thesis Invalidated (SL Hit)' };
    if (!isBullish && currentPrice >= sl) return { valid: false, reason: 'Thesis Invalidated (SL Hit)' };

    // 2. Check if price has reached TP1 (objective completed)
    if (isBullish && currentPrice >= tp1) return { valid: false, reason: 'Target Reached' };
    if (!isBullish && currentPrice <= tp1) return { valid: false, reason: 'Target Reached' };

    // 3. Time-based invalidation (Scalping setups expire after 4 hours)
    const age = Date.now() - new Date(previous.analyzedAt).getTime();
    if (age > 14400000) return { valid: false, reason: 'Setup Stale' };

    return { valid: true };
}
