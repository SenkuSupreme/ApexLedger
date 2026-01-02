export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export type OrderType = 'buy' | 'sell' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';

export interface Candle {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Drawing {
  id: number;
  type: 'line' | 'box' | 'fib' | 'long' | 'short';
  p1: { time: number; price: number };
  p2: { time: number; price: number };
  color: string;
  // Risk/Reward specific
  riskReward?: {
    stopPrice: number;
    targetPrice: number;
    riskRatio: number;
  };
}

export interface Position {
  id: number;
  type: OrderType;
  entryPrice: number;
  lotSize: number;
  slPrice?: number;
  tpPrice?: number;
  isOpen: boolean;
  isPending: boolean;
  entryTime: number;
  exitTime?: number;
  exitPrice?: number;
  pnl?: number;
  commission: number;
  swap: number;
  notes?: string;
  tags?: string[]; // e.g., ["A+", "FOMO"]
  playbook?: string; // e.g., "Gap Fill", "Breakout"
}

export interface AccountStats {
  balance: number;
  equity: number;
  unrealizedPnl: number;
  freeMargin: number;
  winRate: number;
  maxDrawdown: number;
}

export interface NewsEvent {
  id: string;
  time: number;
  title: string;
  impact: 'high' | 'medium' | 'low';
  forecast?: string;
  actual?: string;
  currency: string;
}
