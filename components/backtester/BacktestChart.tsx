import { X } from "lucide-react";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CrosshairMode,
  MouseEventParams
} from "lightweight-charts";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Candle, Drawing, Position } from "./types";

interface BacktestChartProps {
    data: Candle[];
    positions: Position[];
    currentCandle: Candle | null;
    drawTool: 'none' | 'line' | 'box' | 'fib' | 'long' | 'short';
    drawings: Drawing[];
    onDrawComplete: (d: Drawing) => void;
    onRemoveDrawing?: (id: number) => void;
    onUpdateDrawing?: (d: Drawing) => void;
}

export default function BacktestChart({ 
    data, 
    positions, 
    currentCandle, 
    drawTool, 
    drawings,
    onDrawComplete,
    onRemoveDrawing,
    onUpdateDrawing
}: BacktestChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const ema50Ref = useRef<ISeriesApi<"Line"> | null>(null);
    const ema200Ref = useRef<ISeriesApi<"Line"> | null>(null);
    
    // Drawing State
    const [drawingPreview, setDrawingPreview] = useState<Partial<Drawing> | null>(null);
    const isDrawingRef = useRef(false);
    const [hoveredDrawingId, setHoveredDrawingId] = useState<number | null>(null);
    
    // Dragging State
    const isDraggingRef = useRef(false);
    const dragTargetIdRef = useRef<number | null>(null);
    const dragStartCoordsRef = useRef<{ time: number, price: number } | null>(null);
    const dragInitialPointsRef = useRef<{ p1: { time: number, price: number }, p2: { time: number, price: number } } | null>(null);

    // --- Chart Initialization ---
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: { 
                background: { type: ColorType.Solid, color: "#000000" }, 
                textColor: "#9CA3AF",
                fontSize: 10,
                fontFamily: 'Roboto Mono, monospace'
            },
            grid: { 
                vertLines: { color: "rgba(255, 255, 255, 0.03)" }, 
                horzLines: { color: "rgba(255, 255, 255, 0.03)" } 
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 500,
            timeScale: { 
                timeVisible: true, 
                borderColor: "rgba(255, 255, 255, 0.1)",
                barSpacing: 8,
                rightOffset: 5
            },
            rightPriceScale: { 
                borderColor: "rgba(255, 255, 255, 0.1)",
                autoScale: true,
                scaleMargins: { top: 0.1, bottom: 0.1 }
            },
            crosshair: { 
                mode: CrosshairMode.Normal,
                vertLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
                horzLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: drawTool === 'none' && !hoveredDrawingId,
                horzTouchDrag: drawTool === 'none',
                vertTouchDrag: false
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
            }
        });

        const series = chart.addCandlestickSeries({
            upColor: "#10b981",
            downColor: "#ef4444",
            borderVisible: false,
            wickUpColor: "#10b981",
            wickDownColor: "#ef4444"
        });

        const ema50 = chart.addLineSeries({ 
            color: 'rgba(59, 130, 246, 0.4)', 
            lineWidth: 2, 
            priceLineVisible: false,
            crosshairMarkerVisible: false,
            title: 'EMA 50'
        });
        const ema200 = chart.addLineSeries({ 
            color: 'rgba(239, 68, 68, 0.4)', 
            lineWidth: 2, 
            priceLineVisible: false, 
            crosshairMarkerVisible: false,
            title: 'EMA 200'
        });

        chartRef.current = chart;
        candleSeriesRef.current = series;
        ema50Ref.current = ema50;
        ema200Ref.current = ema200;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0] && chartRef.current && canvasRef.current) {
                const { width, height } = entries[0].contentRect;
                chartRef.current.applyOptions({ width, height });
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = width * dpr;
                canvasRef.current.height = height * dpr;
                canvasRef.current.style.width = `${width}px`;
                canvasRef.current.style.height = `${height}px`;
                draw();
            }
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, []);

    // Indicators Calc Helper
    const calculateEMA = (data: Candle[], period: number) => {
        const k = 2 / (period + 1);
        let ema = data[0].close;
        return data.map((d, i) => {
            if (i === 0) return { time: d.time as any, value: ema };
            ema = d.close * k + ema * (1 - k);
            return { time: d.time as any, value: ema };
        });
    };

    // Data Sync
    useEffect(() => {
        if(candleSeriesRef.current && data.length > 0) {
            candleSeriesRef.current.setData(data.map(d => ({ ...d, time: d.time as any })));
            
            // Indicators
            if (ema50Ref.current) ema50Ref.current.setData(calculateEMA(data, 50));
            if (ema200Ref.current) ema200Ref.current.setData(calculateEMA(data, 200));
            
            draw();
        }
    }, [data]);

    // Trade Markers
    useEffect(() => {
        if (!candleSeriesRef.current || positions.length === 0) return;
        
        const markers: any[] = [];
        positions.forEach(p => {
            // Entry marker
            if (!p.isPending && p.entryTime) {
                markers.push({
                    time: p.entryTime as any,
                    position: p.type.includes('buy') ? 'belowBar' : 'aboveBar',
                    color: p.type.includes('buy') ? '#10b981' : '#ef4444',
                    shape: p.type.includes('buy') ? 'arrowUp' : 'arrowDown',
                    text: `${p.type.toUpperCase()} @ ${p.entryPrice.toFixed(5)}`
                });
            }
            
            // Exit marker
            if (p.exitTime && p.exitPrice) {
                const pnlColor = (p.pnl && p.pnl > 0) ? '#10b981' : '#ef4444';
                markers.push({
                    time: p.exitTime as any,
                    position: p.type.includes('buy') ? 'aboveBar' : 'belowBar',
                    color: pnlColor,
                    shape: 'circle',
                    text: `EXIT @ ${p.exitPrice.toFixed(5)} (${p.pnl ? `$${p.pnl.toFixed(2)}` : ''})`
                });
            }
        });
        
        // Sort markers by time in ascending order (required by lightweight-charts)
        markers.sort((a, b) => {
            const timeA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime() / 1000;
            const timeB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime() / 1000;
            return timeA - timeB;
        });
        
        candleSeriesRef.current.setMarkers(markers);
    }, [positions, data]);

    // --- Interaction Helpers ---
    const getCoords = (param: MouseEventParams) => {
        if (!param.point || !chartRef.current || !candleSeriesRef.current) return null;
        const time = chartRef.current.timeScale().coordinateToTime(param.point.x);
        const price = candleSeriesRef.current.coordinateToPrice(param.point.y);
        return { 
            time: time ? (typeof time === 'string' ? new Date(time).getTime()/1000 : time as number) : null, 
            price, 
            x: param.point.x, 
            y: param.point.y 
        };
    };

    // --- Canvas Rendering Engine ---
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !chartRef.current || !candleSeriesRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const timeScale = chartRef.current.timeScale();
        const priceScale = candleSeriesRef.current;

        const allDrawings = [...drawings];
        if (drawingPreview) allDrawings.push(drawingPreview as Drawing);

        allDrawings.forEach(d => {
            const x1 = timeScale.timeToCoordinate(d.p1.time as any);
            const y1 = priceScale.priceToCoordinate(d.p1.price);
            const x2 = timeScale.timeToCoordinate(d.p2.time as any);
            const y2 = priceScale.priceToCoordinate(d.p2.price);

            if (x1 === null || y1 === null || x2 === null || y2 === null) return;

            const isHovered = hoveredDrawingId === d.id;
            const isPreview = d.id === drawingPreview?.id;
            const color = isHovered ? '#60a5fa' : d.type === 'long' ? '#10b981' : d.type === 'short' ? '#ef4444' : '#3b82f6';

            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = isHovered ? 2 : 1.5;

            if (d.type === 'line') {
                if (isPreview) ctx.setLineDash([5, 5]);
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            } else if (d.type === 'box') {
                const x = Math.min(x1, x2);
                const y = Math.min(y1, y2);
                const w = Math.abs(x2 - x1);
                const h = Math.abs(y2 - y1);
                ctx.fillStyle = isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)';
                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);
            } else if (d.type === 'fib') {
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                ctx.setLineDash([]);
                [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0].forEach(level => {
                    const price = d.p1.price + (d.p2.price - d.p1.price) * level;
                    const ly = priceScale.priceToCoordinate(price);
                    if (ly !== null) {
                        ctx.strokeStyle = color; ctx.globalAlpha = isHovered ? 0.8 : 0.4;
                        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(canvas.width/dpr, ly); ctx.stroke();
                        ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.font = '9px Roboto Mono';
                        ctx.fillText(`${level.toFixed(3)} (${price.toFixed(5)})`, Math.max(x1, x2) + 10, ly + 3);
                    }
                });
            } else if (d.type === 'long' || d.type === 'short') {
                const isLong = d.type === 'long';
                const entry = d.p1.price;
                const p2Price = d.p2.price;
                
                // In Long: p1 is Entry, p2 is Target or Stop. Let's say p2 defines Target, and we mirror for stop?
                // TradingView style: p1 is click (Entry), p2 drag defines stop/target.
                // Let's simplify: p2.price is the target, p2.time is far right. stop is p1.price - (p2.price - p1.price).
                const targetDiff = Math.abs(p2Price - entry);
                const stopPrice = isLong ? entry - targetDiff : entry + targetDiff;
                const targetPrice = p2Price;
                
                const ty = priceScale.priceToCoordinate(targetPrice);
                const sy = priceScale.priceToCoordinate(stopPrice);
                const ey = priceScale.priceToCoordinate(entry);

                if (ty !== null && sy !== null && ey !== null) {
                    const boxX = Math.min(x1, x2);
                    const boxW = Math.abs(x2 - x1);
                    
                    // Target Box
                    ctx.fillStyle = isLong ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
                    ctx.fillRect(boxX, Math.min(ey, ty), boxW, Math.abs(ty - ey));
                    // Stop Box
                    ctx.fillStyle = isLong ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)';
                    ctx.fillRect(boxX, Math.min(ey, sy), boxW, Math.abs(sy - ey));
                    
                    // Outline and accents
                    ctx.strokeStyle = isLong ? '#10b981' : '#ef4444'; ctx.lineWidth = 1;
                    ctx.strokeRect(boxX, Math.min(ey, ty), boxW, Math.abs(ty - ey));
                    ctx.strokeStyle = isLong ? '#ef4444' : '#10b981';
                    ctx.strokeRect(boxX, Math.min(ey, sy), boxW, Math.abs(sy - ey));

                    // Middle Line
                    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(boxX, ey); ctx.lineTo(boxX + boxW, ey); ctx.stroke();
                    
                    // Ratio Label
                    const ratio = (Math.abs(targetPrice - entry) / Math.abs(stopPrice - entry)).toFixed(2);
                    const labelY = isLong ? ty - 5 : ty + 12;
                    
                    ctx.fillStyle = 'white'; ctx.font = 'bold 11px Roboto Mono';
                    ctx.fillText(`Ratio: ${ratio}`, boxX + 10, labelY);
                    
                    // Stats Labels
                    ctx.font = '9px Roboto Mono'; ctx.globalAlpha = 0.7;
                    const pips = (Math.abs(targetPrice - entry) / 0.0001).toFixed(1);
                    ctx.fillText(`${pips} Pips`, boxX + 10, labelY + (isLong ? -12 : 12));
                    ctx.globalAlpha = 1.0;
                }
            }
            ctx.restore();
        });
    }, [drawings, drawingPreview, hoveredDrawingId]);

    // Update charts on scale change
    useEffect(() => {
        if (!chartRef.current) return;
        const sub = () => draw();
        chartRef.current.timeScale().subscribeVisibleTimeRangeChange(sub);
        chartRef.current.subscribeCrosshairMove(sub);
        return () => {
            chartRef.current?.timeScale().unsubscribeVisibleTimeRangeChange(sub);
            chartRef.current?.unsubscribeCrosshairMove(sub);
        };
    }, [draw]);

    // --- Mouse Handlers (Unified) ---
    const handleCanvasClick = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const coords = getCoords({ point: { x, y } } as MouseEventParams);
        if (!coords || coords.time === null || coords.price === null) return;

        if (drawTool !== 'none') {
            if (!isDrawingRef.current) {
                isDrawingRef.current = true;
                setDrawingPreview({
                    id: Date.now(),
                    type: drawTool,
                    p1: { time: coords.time!, price: coords.price! },
                    p2: { time: coords.time!, price: coords.price! }
                });
            } else {
                if (drawingPreview) {
                    onDrawComplete({
                        ...(drawingPreview as Drawing),
                        p2: { time: coords.time!, price: coords.price! }
                    });
                }
                isDrawingRef.current = false;
                setDrawingPreview(null);
            }
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const coords = getCoords({ point: { x, y } } as MouseEventParams);
        if (!coords) return;

        if (isDrawingRef.current && drawingPreview) {
            setDrawingPreview(prev => prev ? ({
                ...prev,
                p2: { time: coords.time!, price: coords.price! }
            }) : null);
            draw();
        } else if (isDraggingRef.current && dragTargetIdRef.current && dragStartCoordsRef.current && dragInitialPointsRef.current) {
            const dt = coords.time! - dragStartCoordsRef.current.time;
            const dp = coords.price! - dragStartCoordsRef.current.price;
            
            const target = drawings.find(d => d.id === dragTargetIdRef.current);
            if (target) {
                target.p1.time = dragInitialPointsRef.current.p1.time + dt;
                target.p1.price = dragInitialPointsRef.current.p1.price + dp;
                target.p2.time = dragInitialPointsRef.current.p2.time + dt;
                target.p2.price = dragInitialPointsRef.current.p2.price + dp;
                draw();
            }
        } else if (drawTool === 'none') {
            const timeScale = chartRef.current!.timeScale();
            const priceScale = candleSeriesRef.current!;
            let found: number | null = null;
            
            for (const d of drawings) {
                const x1 = timeScale.timeToCoordinate(d.p1.time as any);
                const y1 = priceScale.priceToCoordinate(d.p1.price);
                const x2 = timeScale.timeToCoordinate(d.p2.time as any);
                const y2 = priceScale.priceToCoordinate(d.p2.price);
                if (x1 === null || y1 === null || x2 === null || y2 === null) continue;

                if (d.type === 'line' || d.type === 'fib') {
                    const L2 = (x2-x1)**2 + (y2-y1)**2;
                    const t = L2 === 0 ? 0 : Math.max(0, Math.min(1, ((x-x1)*(x2-x1) + (y-y1)*(y2-y1)) / L2));
                    const dist = Math.sqrt((x - (x1 + t*(x2-x1)))**2 + (y - (y1 + t*(y2-y1)))**2);
                    if (dist < 10) { found = d.id; break; }
                } else {
                    if (x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2)) {
                        found = d.id; break;
                    }
                }
            }
            if (found !== hoveredDrawingId) setHoveredDrawingId(found);
            draw();
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (drawTool !== 'none') return;
        if (hoveredDrawingId !== null) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const coords = getCoords({ point: { x, y } } as MouseEventParams);
            if (!coords) return;
            
            const target = drawings.find(d => d.id === hoveredDrawingId);
            if (!target) return;

            isDraggingRef.current = true;
            dragTargetIdRef.current = hoveredDrawingId;
            dragStartCoordsRef.current = { time: coords.time!, price: coords.price! };
            dragInitialPointsRef.current = { p1: { ...target.p1 }, p2: { ...target.p2 } };
        }
    };

    const handleCanvasMouseUp = () => {
        if (isDraggingRef.current && dragTargetIdRef.current) {
            const target = drawings.find(d => d.id === dragTargetIdRef.current);
            if (target && onUpdateDrawing) {
                onUpdateDrawing({ ...target });
            }
        }
        isDraggingRef.current = false;
        dragTargetIdRef.current = null;
    };

    return (
        <div className="flex-1 relative bg-black group overflow-hidden">
            <div ref={chartContainerRef} className="absolute inset-0 z-0" />
            <canvas 
                ref={canvasRef} 
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseDown={handleCanvasMouseDown}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className={`absolute inset-0 z-10 ${hoveredDrawingId ? 'cursor-move' : (drawTool !== 'none' ? 'cursor-crosshair' : 'pointer-events-none')}`}
                style={{ pointerEvents: (hoveredDrawingId || drawTool !== 'none' || isDrawingRef.current) ? 'auto' : 'none' }}
            />
            
            {/* Tool Indicators */}
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                {drawTool !== 'none' && (
                    <div className="flex items-center gap-3 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 px-4 py-2 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{drawTool} ACTIVE</span>
                        <button onClick={(e) => { e.stopPropagation(); isDrawingRef.current = false; setDrawingPreview(null); }} className="hover:bg-white/10 rounded-lg p-1 transition-colors">
                            <X size={14} className="text-white/60 hover:text-white" />
                        </button>
                    </div>
                )}
                {hoveredDrawingId && drawTool === 'none' && (
                    <div className="flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none">Drawing Selected</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemoveDrawing?.(hoveredDrawingId); setHoveredDrawingId(null); }} 
                            className="bg-red-500 hover:bg-red-400 text-white p-1 rounded transition-colors"
                        >
                            <X size={10} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


