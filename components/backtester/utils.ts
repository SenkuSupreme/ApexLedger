import { Candle, Timeframe, OrderType } from "./types";

export const SPREAD_PIPS = 1.5;
export const COMMISSION_PER_LOT = 7.0;

export const resampleData = (baseData: Candle[], timeframe: Timeframe): Candle[] => {
  if (timeframe === '1m') return baseData;

  const tfMinutes = {
    '5m': 5,
    '15m': 15,
    '1h': 60,
    '4h': 240,
    '1d': 1440
  }[timeframe];

  const resampled: Candle[] = [];
  let currentCandle: Candle | null = null;

  baseData.forEach((candle) => {
    // Determine the bucket start time
    const timestamp = candle.time; 
    const bucket = Math.floor(timestamp / (tfMinutes * 60)) * (tfMinutes * 60);

    if (!currentCandle || currentCandle.time !== bucket) {
      if (currentCandle) resampled.push(currentCandle);
      currentCandle = {
        time: bucket,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close
      };
    } else {
      currentCandle.high = Math.max(currentCandle.high, candle.high);
      currentCandle.low = Math.min(currentCandle.low, candle.low);
      currentCandle.close = candle.close;
    }
  });

  if (currentCandle) resampled.push(currentCandle);
  return resampled;
};


export const calculatePnL = (type: OrderType, entry: number, exit: number, lots: number) => {
    // Standard Lot = 100,000 units
    // Profit = (Exit - Entry) * Units (for Long)
    const units = lots * 100000;
    if (type.includes('buy')) {
        return (exit - entry) * units;
    } else {
        return (entry - exit) * units;
    }
 };
