import { useState, useCallback, useEffect } from "react";
import { Position, AccountStats, OrderType, Candle } from "./types";
import { calculatePnL, COMMISSION_PER_LOT, SPREAD_PIPS } from "./utils";

interface TradingEngineConfig {
    initialBalance?: number;
    leverage?: number;
}

export const useTradingEngine = (currentCandle: Candle | null, config: TradingEngineConfig = {}) => {
    const { initialBalance = 100000, leverage = 100 } = config;
    
    // --- State ---
    const [positions, setPositions] = useState<Position[]>([]);
    const [account, setAccount] = useState<AccountStats>({
        balance: initialBalance,
        equity: initialBalance,
        unrealizedPnl: 0,
        freeMargin: initialBalance,
        winRate: 0,
        maxDrawdown: 0
    });
    const [accountLeverage, setAccountLeverage] = useState(leverage);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("backtest_session");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.positions) setPositions(data.positions);
                if (data.account) setAccount(data.account);
                if (data.leverage) setAccountLeverage(data.leverage);
            } catch (e) {
                console.error("Failed to load session", e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem("backtest_session", JSON.stringify({ positions, account, leverage: accountLeverage }));
        }, 1000);
        return () => clearTimeout(timeout);
    }, [positions, account, accountLeverage]);

    // Reset balance function
    const setBalance = useCallback((newBalance: number) => {
        setAccount(prev => ({
            ...prev,
            balance: newBalance,
            equity: newBalance + prev.unrealizedPnl,
            freeMargin: newBalance
        }));
    }, []);

    const setLeverage = useCallback((newLeverage: number) => {
        setAccountLeverage(newLeverage);
    }, []);

    // Calculate required margin
    const calculateMargin = (lotSize: number, price: number) => {
        return (lotSize * 100000 * price) / accountLeverage;
    };

    // --- Actions ---
    const placeOrder = useCallback((type: OrderType, lotSize: number, price: number, sl?: number, tp?: number) => {
        // Margin check
        const requiredMargin = calculateMargin(lotSize, price);
        if (requiredMargin > account.freeMargin) {
            alert(`Insufficient margin! Required: $${requiredMargin.toFixed(2)}, Available: $${account.freeMargin.toFixed(2)}`);
            return;
        }

        const isPending = type.includes('limit') || type.includes('stop');
        
        const newOrder: Position = {
            id: Date.now(),
            type,
            entryPrice: price,
            lotSize,
            slPrice: sl,
            tpPrice: tp,
            isOpen: !isPending,
            isPending: isPending,
            entryTime: currentCandle ? currentCandle.time : Date.now() / 1000,
            commission: COMMISSION_PER_LOT * lotSize,
            swap: 0
        };
        
        setPositions(prev => [...prev, newOrder]);
    }, [currentCandle, account.freeMargin, accountLeverage]);

    const closePosition = useCallback((id: number) => {
        if(!currentCandle) return;
        setPositions(prev => prev.map(p => {
            if(p.id === id && p.isOpen) {
                const exitPrice = currentCandle.close;
                const profit = calculatePnL(p.type, p.entryPrice, exitPrice, p.lotSize);
                const net = profit - p.commission;
                
                setAccount(a => ({ ...a, balance: a.balance + net }));
                return { ...p, isOpen: false, exitTime: currentCandle.time, exitPrice, pnl: net };
            }
            return p;
        }));
    }, [currentCandle]);

    const partialClose = useCallback((id: number) => {
        if(!currentCandle) return;
        setPositions(prev => prev.map(p => {
           if(p.id === id) {
               const closeLots = Number((p.lotSize / 2).toFixed(2));
               const remainLots = Number((p.lotSize - closeLots).toFixed(2));
               
               const exitPrice = currentCandle.close;
               const profit = calculatePnL(p.type, p.entryPrice, exitPrice, closeLots);
               
               setAccount(a => ({ ...a, balance: a.balance + profit - (p.commission / 2) }));
               return { ...p, lotSize: remainLots };
           } 
           return p;
        }));
    }, [currentCandle]);

    // --- Tick Update Logic ---
    useEffect(() => {
        if(!currentCandle) return;

        const bid = currentCandle.close;
        const ask = currentCandle.close + (SPREAD_PIPS * 0.0001);

        setPositions(prev => prev.map(p => {
            // A. Pending Orders Trigger
            if (p.isPending) {
                let triggered = false;
                let fillPrice = 0;

                if (p.type === 'buy_limit' && ask <= p.entryPrice) { triggered = true; fillPrice = p.entryPrice; }
                if (p.type === 'sell_limit' && bid >= p.entryPrice) { triggered = true; fillPrice = p.entryPrice; }
                if (p.type === 'buy_stop' && ask >= p.entryPrice) { triggered = true; fillPrice = p.entryPrice; }
                if (p.type === 'sell_stop' && bid <= p.entryPrice) { triggered = true; fillPrice = p.entryPrice; }

                if (triggered) {
                    return { ...p, isPending: false, isOpen: true, entryTime: currentCandle.time, entryPrice: fillPrice, type: p.type.split('_')[0] as OrderType };
                }
                return p;
            }

            // B. Active Position Checks (SL/TP)
            if (p.isOpen && !p.exitTime) {
                let closeReason = null;
                let exitPrice = 0;

                if (p.type === 'buy') {
                    if (p.slPrice && bid <= p.slPrice) { closeReason = 'SL'; exitPrice = p.slPrice; }
                    else if (p.tpPrice && bid >= p.tpPrice) { closeReason = 'TP'; exitPrice = p.tpPrice; }
                } else {
                    if (p.slPrice && ask >= p.slPrice) { closeReason = 'SL'; exitPrice = p.slPrice; }
                    else if (p.tpPrice && ask <= p.tpPrice) { closeReason = 'TP'; exitPrice = p.tpPrice; }
                }

                if (closeReason) {
                    const profit = calculatePnL(p.type, p.entryPrice, exitPrice, p.lotSize);
                    const net = profit - p.commission;
                    
                    // Update balance immediately
                    setAccount(a => ({ ...a, balance: a.balance + net }));
                    return { ...p, isOpen: false, exitTime: currentCandle.time, exitPrice, pnl: net, notes: `${closeReason}` };
                }
            }
            return p;
        }));

    }, [currentCandle]);

    // Equity & Margin Calc
    useEffect(() => {
        if(!currentCandle) return;
        const bid = currentCandle.close;
        const ask = currentCandle.close + (SPREAD_PIPS * 0.0001);
        
        let floats = 0;
        let usedMargin = 0;
        
        positions.forEach(p => {
             if (p.isOpen) {
                  const currentPrice = p.type === 'buy' ? bid : ask;
                  floats += calculatePnL(p.type, p.entryPrice, currentPrice, p.lotSize) - p.commission;
                  usedMargin += calculateMargin(p.lotSize, p.entryPrice);
             }
        });
        
        setAccount(prev => ({
            ...prev,
            unrealizedPnl: floats,
            equity: prev.balance + floats,
            freeMargin: prev.balance + floats - usedMargin
        }));
        
    }, [currentCandle, positions, accountLeverage]);

    // --- Journaling Actions ---
    const updatePosition = useCallback((id: number, updates: Partial<Position>) => {
        setPositions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const moveToBreakeven = useCallback((id: number) => {
        setPositions(prev => prev.map(p => {
            if(p.id === id && p.isOpen) {
                return { ...p, slPrice: p.entryPrice };
            }
            return p;
        }));
    }, []);

    return {
        positions,
        account,
        leverage: accountLeverage,
        placeOrder,
        closePosition,
        partialClose,
        updatePosition,
        moveToBreakeven,
        setBalance,
        setLeverage
    };
};
