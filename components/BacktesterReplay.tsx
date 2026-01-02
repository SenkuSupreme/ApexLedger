"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  Time, 
  CrosshairMode,
  SeriesMarker
} from "lightweight-charts";
import { 
  Play, Pause, FastForward, SkipBack, Plus, Minus, X, Check, 
  TrendingUp, Activity, BarChart2, DollarSign, Target, ShieldAlert,
  Settings, Layers, ChevronRight, ChevronDown, MonitorPlay,
  Pencil, Square, MousePointer2, Percent, Briefcase, Clock, FileText,
  LayoutGrid, Trash2
} from "lucide-react";

import { useBacktestEngine } from "./backtester/useBacktestEngine";
import { useTradingEngine } from "./backtester/useTradingEngine";
import { useNewsEngine } from "./backtester/useNewsEngine";
import { useChartData } from "./backtester/useChartData";
import { resampleData } from "./backtester/utils";
import { OrderType, Candle, Timeframe, Drawing } from "./backtester/types";

// Components
import BacktestChart from "./backtester/BacktestChart";
import SessionControls from "./backtester/SessionControls";
import OrderPanel from "./backtester/OrderPanel";
import StatsPanel from "./backtester/StatsPanel";

interface ChartConfig {
    id: number;
    timeframe: Timeframe;
}

// Wrapper to handle individual data slicing per chart
const ChartWrapper = ({ 
    config, 
    baseData, 
    currentTime, 
    positions, 
    drawTool, 
    drawings,
    onDrawComplete,
    onRemoveDrawing,
    onUpdateDrawing,
    onRemove 
}: { 
    config: ChartConfig, 
    baseData: Candle[], 
    currentTime: number, 
    positions: any[], 
    drawTool: any,
    drawings: Drawing[],
    onDrawComplete: (d: Drawing) => void,
    onRemoveDrawing: (id: number) => void,
    onUpdateDrawing: (d: Drawing) => void,
    onRemove: (id: number) => void
}) => {
    const { viewData } = useChartData(baseData, currentTime, config.timeframe);

    return (
        <div className="relative border border-white/5 bg-black flex flex-col min-h-0 min-w-0">
             <div className="absolute top-2 left-2 z-20 flex gap-2">
                  <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white">{config.timeframe}</span>
                  <button onClick={() => onRemove(config.id)} className="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"><X size={12}/></button>
             </div>
             <BacktestChart 
                data={viewData}
                positions={positions}
                currentCandle={null}
                drawTool={drawTool}
                drawings={drawings}
                onDrawComplete={onDrawComplete} 
                onRemoveDrawing={onRemoveDrawing}
                onUpdateDrawing={onUpdateDrawing}
             />
        </div>
    );
};

export default function BacktesterReplay() {
    // 1. Engine
    const engine = useBacktestEngine();
    
    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            if (e.code === 'Space') {
                e.preventDefault();
                engine.setIsPlaying(!engine.isPlaying);
            }
            if (e.code === 'ArrowRight') {
                engine.stepForward();
            }
            if (e.code === 'ArrowLeft') {
                engine.stepBack();
            }
            if (e.code === 'KeyB') {
                e.preventDefault();
                handlePlaceOrder(); 
            }
            if (e.code === 'KeyS') {
                e.preventDefault();
                setOrderType('sell');
                setTimeout(() => handlePlaceOrder(), 10);
            }
            if (e.code === 'KeyC') {
                e.preventDefault();
                trading.positions.forEach(p => {
                    if(p.isOpen) trading.closePosition(p.id);
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [engine.isPlaying, engine.stepForward, engine.stepBack]);

    // 2. Charts State
    const [charts, setCharts] = useState<ChartConfig[]>([
        { id: 1, timeframe: '1h' }
    ]);

    const addChart = () => {
        if(charts.length >= 4) return;
        const nextId = Math.max(...charts.map(c => c.id)) + 1;
        setCharts([...charts, { id: nextId, timeframe: '5m' }]);
    };

    const removeChart = (id: number) => {
        if(charts.length > 1) {
            setCharts(charts.filter(c => c.id !== id));
        }
    };

    // 3. Current Tick Logic
    const currentM1Candle = useMemo(() => {
         return engine.baseData.find(d => d.time === engine.currentTime) 
                || engine.baseData[engine.baseData.length - 1];
    }, [engine.baseData, engine.currentTime]);

    // 4. Trading with configurable balance & leverage
    const [initialBalance, setInitialBalance] = useState(100000);
    const [accountLeverage, setAccountLeverage] = useState(100);
    
    const trading = useTradingEngine(currentM1Candle || null, {
        initialBalance,
        leverage: accountLeverage
    });
    
    // 5. News Logic
    const news = useNewsEngine(engine.currentTime);

    // 6. UI State
    const [drawTool, setDrawTool] = useState<'none' | 'line' | 'box' | 'fib' | 'long' | 'short'>('none');
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [orderType, setOrderType] = useState<OrderType>('buy');
    const [pendingPrice, setPendingPrice] = useState<number>(0);
    const [lotSize, setLotSize] = useState(1.0);
    const [riskPercent, setRiskPercent] = useState(1.0);
    const [lotSizeMode, setLotSizeMode] = useState<'lots' | 'risk'>('risk');
    const [slPips, setSlPips] = useState(20);
    const [tpPips, setTpPips] = useState(40);

    // Layout State
    const [showSidebar, setShowSidebar] = useState(true);
    const [showBottomPanel, setShowBottomPanel] = useState(true);
    const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    // Persistence: Drawings (symbol-specific and timeframe-independent)
    useEffect(() => {
        const saved = localStorage.getItem(`drawings_${engine.symbol}`);
        if (saved) {
            try {
                setDrawings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse drawings", e);
                setDrawings([]);
            }
        } else {
            setDrawings([]);
        }
    }, [engine.symbol]);

    useEffect(() => {
        localStorage.setItem(`drawings_${engine.symbol}`, JSON.stringify(drawings));
    }, [drawings, engine.symbol]);

    // Bottom Panel Resize Logic
    useEffect(() => {
        if (!isResizing) return;
        const handleMouseMove = (e: MouseEvent) => {
            const h = window.innerHeight - e.clientY;
            setBottomPanelHeight(Math.max(100, Math.min(600, h)));
        };
        const handleMouseUp = () => setIsResizing(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Handlers
    const handleDrawComplete = (d: Drawing) => {
        setDrawings(prev => [...prev, d]);
        setDrawTool('none');
    };

    const handleRemoveDrawing = (id: number) => {
        setDrawings(prev => prev.filter(d => d.id !== id));
    };

    const handleUpdateDrawing = (updated: Drawing) => {
        setDrawings(prev => prev.map(d => d.id === updated.id ? updated : d));
    };

    const clearDrawings = () => {
        setDrawings([]);
        localStorage.removeItem(`drawings_${engine.symbol}`);
    };

    const handlePlaceOrder = (priceOverride?: number) => {
        if(!currentM1Candle) return;
        const price = priceOverride || currentM1Candle.close;
        const baseType = orderType.includes('buy') ? 'buy' : 'sell';
        
        let finalLots = lotSize;
        if (lotSizeMode === 'risk' && slPips > 0) {
            const riskUsd = trading.account.balance * (riskPercent / 100);
            finalLots = Number((riskUsd / (slPips * 10)).toFixed(2));
            if (finalLots < 0.01) finalLots = 0.01;
        }

        const sl = slPips > 0 ? (baseType === 'buy' ? price - (slPips * 0.0001) : price + (slPips * 0.0001)) : undefined;
        const tp = tpPips > 0 ? (baseType === 'buy' ? price + (tpPips * 0.0001) : price - (tpPips * 0.0001)) : undefined;
        
        trading.placeOrder(orderType, finalLots, price, sl, tp);
    };

    return (
        <div className="flex flex-col h-screen max-h-[100vh] bg-[#050505] text-gray-300 font-sans overflow-hidden">
            
            {/* Top Bar with Grid Controls */}
            <div className="flex items-center justify-between bg-[#0A0A0A] border-b border-white/5 pr-4 shrink-0">
                <SessionControls 
                    symbol={engine.symbol}
                    setSymbol={engine.setSymbol}
                    timeframe={engine.timeframe}
                    setTimeframe={engine.setTimeframe}
                    isPlaying={engine.isPlaying}
                    setIsPlaying={engine.setIsPlaying}
                    playbackSpeed={engine.playbackSpeed}
                    setPlaybackSpeed={engine.setPlaybackSpeed}
                    currentTime={engine.currentTime}
                    jumpToDate={engine.jumpToDate}
                    account={trading.account}
                    isLoading={engine.isLoading}
                    leverage={trading.leverage}
                    onBalanceChange={(balance) => {
                        setInitialBalance(balance);
                        trading.setBalance(balance);
                    }}
                    onLeverageChange={(leverage) => {
                        setAccountLeverage(leverage);
                        trading.setLeverage(leverage);
                    }}
                />
                
                {/* Replay Step Controls */}
                <div className="flex items-center bg-white/5 rounded-lg border border-white/5 p-1 gap-1 mx-4">
                    <button onClick={engine.stepBack} className="p-2 hover:bg-white/10 rounded-md text-gray-400 group relative" title="Step Back (1 Candle)">
                        <ChevronRight size={18} strokeWidth={3} className="rotate-180" />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/10 text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">Back (←)</span>
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <button onClick={engine.stepForward} className="p-2 hover:bg-white/10 rounded-md text-blue-400 group relative" title="Step Forward (1 Candle)">
                        <ChevronRight size={18} strokeWidth={3} />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/10 text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">Step (→)</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={addChart} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all active:scale-95">
                        <LayoutGrid size={14} className="text-blue-500" /> Add Chart
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <button 
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-2 rounded hover:bg-white/5 transition-all ${showSidebar ? 'text-blue-400' : 'text-gray-600'}`}
                    >
                        <Layers size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex min-h-0 relative overflow-hidden">
                
                {engine.isLoading && (
                    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
                            <div className="text-blue-500 font-mono text-xl animate-pulse tracking-widest uppercase">Loading Data...</div>
                        </div>
                    </div>
                )}

                {/* Left Toolbar */}
                <div className="w-12 border-r border-white/5 flex flex-col items-center py-4 gap-4 bg-[#0A0A0A] z-30">
                    <div className="flex flex-col gap-1 items-center pb-4 border-b border-white/5 w-full">
                        <button onClick={() => setDrawTool('none')} className={`p-2 rounded-lg transition-all ${drawTool === 'none' ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`} title="Cursor"><MousePointer2 size={18} /></button>
                        <button onClick={() => setDrawTool('line')} className={`p-2 rounded-lg transition-all ${drawTool === 'line' ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`} title="Trend Line"><Pencil size={18} /></button>
                        <button onClick={() => setDrawTool('box')} className={`p-2 rounded-lg transition-all ${drawTool === 'box' ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`} title="Box/Rectangle"><Square size={18} /></button>
                        <button onClick={() => setDrawTool('fib')} className={`p-2 rounded-lg transition-all ${drawTool === 'fib' ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`} title="Fibonacci Retracement"><Percent size={18} /></button>
                        
                        <div className="h-px bg-white/5 w-8 my-2" />
                        
                        <button onClick={() => setDrawTool('long')} className={`p-2 rounded-lg transition-all ${drawTool === 'long' ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/5'}`} title="Long Position">
                            <TrendingUp size={18} />
                        </button>
                        <button onClick={() => setDrawTool('short')} className={`p-2 rounded-lg transition-all ${drawTool === 'short' ? 'bg-red-500/20 text-red-500' : 'text-gray-500 hover:text-red-500 hover:bg-red-500/5'}`} title="Short Position">
                            <TrendingUp size={18} className="rotate-180" />
                        </button>
                    </div>
                    <button onClick={clearDrawings} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Clear All Drawings"><Trash2 size={18}/></button>
                </div>

                {/* Grid Layout */}
                <div className={`flex-1 grid gap-px bg-white/5 transition-all duration-300 ${charts.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} ${charts.length > 2 ? 'grid-rows-2' : 'grid-rows-1'}`}>
                    {charts.map(chartConfig => (
                        <ChartWrapper 
                            key={chartConfig.id}
                            config={chartConfig}
                            baseData={engine.baseData}
                            currentTime={engine.currentTime}
                            positions={trading.positions}
                            drawTool={drawTool}
                            drawings={drawings}
                            onDrawComplete={handleDrawComplete}
                            onRemoveDrawing={handleRemoveDrawing}
                            onUpdateDrawing={handleUpdateDrawing}
                            onRemove={removeChart}
                        />
                    ))}
                </div>


                <div className={`transition-all duration-300 overflow-hidden ${showSidebar ? 'w-80 border-l border-white/5' : 'w-0 border-l-0'}`}>
                    <OrderPanel 
                        orderType={orderType} setOrderType={setOrderType}
                        lotSize={lotSize} setLotSize={setLotSize}
                        slPips={slPips} setSlPips={setSlPips}
                        tpPips={tpPips} setTpPips={setTpPips}
                        onPlaceOrder={handlePlaceOrder}
                        pendingPrice={pendingPrice} setPendingPrice={setPendingPrice}
                        balance={trading.account.balance}
                        riskPercent={riskPercent} setRiskPercent={setRiskPercent}
                        lotSizeMode={lotSizeMode} setLotSizeMode={setLotSizeMode}
                    />
                </div>
            </div>

            {/* Bottom Panel Resize Handle */}
            <div 
                className="h-1 bg-white/5 hover:bg-blue-500/50 cursor-ns-resize transition-colors"
                onMouseDown={() => setIsResizing(true)}
            />

            {/* Bottom Panel */}
            <div style={{ height: showBottomPanel ? bottomPanelHeight : 32 }} className="transition-[height] duration-200 overflow-hidden relative">
                <div className="absolute top-0 right-4 z-20 h-8 flex items-center">
                    <button 
                        onClick={() => setShowBottomPanel(!showBottomPanel)}
                        className="p-1 hover:bg-white/5 rounded text-gray-600 hover:text-white transition-all"
                    >
                        {showBottomPanel ? <ChevronDown size={14} /> : <ChevronRight size={14} className="-rotate-90" />}
                    </button>
                </div>
                <StatsPanel 
                    positions={trading.positions}
                    account={trading.account}
                    currentCandle={currentM1Candle || null}
                    onClosePosition={trading.closePosition}
                    onPartialClose={trading.partialClose}
                    onBE={trading.moveToBreakeven}
                    updatePosition={trading.updatePosition}
                    newsEvents={news.events}
                />
            </div>
        </div>
    );
}
