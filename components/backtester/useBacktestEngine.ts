import { useState, useEffect, useCallback } from "react";
import { Candle, Timeframe } from "./types";

const M1_SECONDS = 60;

// Mock Data Generator (Enhanced)
const generateData = (symbol: string, startDate: Date, days: number = 90): Candle[] => {
    const data: Candle[] = [];
    let time = Math.floor(startDate.getTime() / 1000);
    let price = symbol === 'XAUUSD' ? 2000 : symbol.includes('JPY') ? 140 : 1.0800;
    
    const count = days * 24 * 60; // M1 candles
    
    // Volatility state for momentum clusters
    let currentDrift = 0;
    let momentum = 0;
    
    for (let i = 0; i < count; i++) {
        const date = new Date(time * 1000);
        const hour = date.getUTCHours();
        
        // 1. Session-based Volatility
        let sessionMultiplier = 0.5; // Default Asian/Quiet
        if (hour >= 8 && hour < 17) sessionMultiplier = 1.8; // London 
        if (hour >= 13 && hour < 21) sessionMultiplier = 2.2; // NY Overlap / Session
        
        const baseVolatility = symbol === 'XAUUSD' ? 0.4 : symbol.includes('JPY') ? 0.05 : 0.00015;
        const currentVol = baseVolatility * sessionMultiplier;

        // 2. Momentum & Drift (Simulate Trends)
        if (i % 240 === 0) { // Every 4 hours, change major drift
            currentDrift = (Math.random() - 0.5) * (currentVol * 0.2);
            momentum = (Math.random() - 0.5) * 5; // New breakout momentum
        }
        
        // 3. Noise + Momentum
        const noise = (Math.random() - 0.5) * currentVol;
        const move = noise + currentDrift + (momentum * 0.01 * currentVol);
        
        // Decay momentum
        momentum *= 0.98;

        const open = price;
        const close = price + move;
        const high = Math.max(open, close) + Math.random() * (currentVol * 0.6);
        const low = Math.min(open, close) - Math.random() * (currentVol * 0.6);
        
        data.push({ time, open, high, low, close });
        price = close;
        time += M1_SECONDS;
    }
    return data;
};

export const useBacktestEngine = () => {
  // --- State ---
  const [symbol, setSymbol] = useState<string>('EURUSD');
  const [baseData, setBaseData] = useState<Candle[]>([]); 
  const [currentTime, setCurrentTime] = useState<number>(0); 
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
          const start = new Date("2023-01-01"); // Default start
          const data = generateData(symbol, start, 180); // Load 180 days (~260k candles). 
          // Note: Real "10 Years" would involve dynamic loading usually. 
          // For this demo, we load a 6-month chunk.
          setBaseData(data);
          setCurrentTime(data[1000]?.time || start.getTime()/1000);
          setIsLoading(false);
      }, 500);
  }, [symbol]);

  // --- Playback Loop ---
  useEffect(() => {
      let interval: any;
      if (isPlaying) {
          // Dynamic interval based on speed:
          // Low speed (1-10): Update every 100ms
          // High speed (10+): Update every 20ms or skip candles
          const msFn = playbackSpeed > 10 ? 20 : 100;
          
          interval = setInterval(() => {
              setCurrentTime(prev => {
                  const step = M1_SECONDS * (playbackSpeed > 10 ? Math.floor(playbackSpeed/2) : 1); 
                  // If speed is 1, we advance 1 min every 100ms.
                  // Realtime-ish feel: speed 1 = 1 candle/sec? 
                  // User asked for "Live-like". Usually means 1 tick per N ms.
                  // Let's adhere to: Speed 1 = 1 M1 candle per second. 
                  
                  const nextTime = prev + M1_SECONDS; 
                  // We jump M1 by M1. 
                  // To support "Speed", we reduce the interval delay.
                  
                  const lastTime = baseData[baseData.length - 1]?.time || 0;
                  if (nextTime >= lastTime) {
                      setIsPlaying(false);
                      return lastTime;
                  }
                  return nextTime;
              });
          }, 1000 / playbackSpeed); 
      }
      return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, baseData]);

  // --- Actions ---
  const stepForward = useCallback(() => {
      const minutes = { '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1d': 1440 }[timeframe] || 1;
      setCurrentTime(t => t + (minutes * M1_SECONDS));
  }, [timeframe]);

  const stepBack = useCallback(() => {
      const minutes = { '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1d': 1440 }[timeframe] || 1;
      setCurrentTime(t => t - (minutes * M1_SECONDS));
  }, [timeframe]);

  const jumpToDate = useCallback((dateStr: string) => {
      const ts = Math.floor(new Date(dateStr).getTime() / 1000);
      const first = baseData[0]?.time;
      const last = baseData[baseData.length - 1]?.time;
      
      if (ts < first || ts > last) {
          setIsLoading(true);
          setTimeout(() => {
             const newData = generateData(symbol, new Date(dateStr), 180);
             setBaseData(newData);
             setCurrentTime(ts);
             setIsLoading(false);
          }, 500);
      } else {
          setCurrentTime(Math.floor(ts / 60) * 60);
      }
  }, [baseData, symbol]);

  return {
      symbol, setSymbol,
      baseData,
      currentTime, setCurrentTime,
      isPlaying, setIsPlaying,
      playbackSpeed, setPlaybackSpeed,
      timeframe, setTimeframe,
      isLoading,
      stepForward,
      stepBack,
      jumpToDate
  };
};
