import React from "react";
import { Plus, Minus, Settings, Shield, Target, Zap } from "lucide-react";
import { OrderType } from "./types";

interface OrderPanelProps {
    orderType: OrderType;
    setOrderType: (t: OrderType) => void;
    lotSize: number;
    setLotSize: (l: number) => void;
    slPips: number;
    setSlPips: (p: number) => void;
    tpPips: number;
    setTpPips: (p: number) => void;
    onPlaceOrder: (price?: number) => void;
    pendingPrice: number;
    setPendingPrice: (p: number) => void;
    balance: number;
    riskPercent: number;
    setRiskPercent: (r: number) => void;
    lotSizeMode: 'lots' | 'risk';
    setLotSizeMode: (m: 'lots' | 'risk') => void;
}

export default function OrderPanel({
    orderType, setOrderType,
    lotSize, setLotSize,
    slPips, setSlPips,
    tpPips, setTpPips,
    onPlaceOrder,
    pendingPrice, setPendingPrice,
    balance,
    riskPercent, setRiskPercent,
    lotSizeMode, setLotSizeMode
}: OrderPanelProps) {

    // Simple risk calc: 1 Lot = $10/pip on most majors
    const riskAmount = lotSizeMode === 'lots' 
        ? (slPips * 10 * lotSize).toFixed(2)
        : (balance * (riskPercent / 100)).toFixed(2);
    
    const calculatedLotSize = lotSizeMode === 'risk'
        ? Number((Number(riskAmount) / (slPips * 10)).toFixed(2))
        : lotSize;

    const isBuy = orderType.includes('buy');

    return (
        <div className="w-80 border-l border-white/5 flex flex-col bg-[#080808] h-full shadow-2xl relative z-40">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Execution Terminal</h3>
                </div>
                <Settings size={14} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Mode Selector */}
                <div className="flex bg-black border border-white/10 rounded-xl p-1 mb-6">
                    <button 
                        onClick={() => setOrderType('buy')} 
                        className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${orderType==='buy' ? 'bg-emerald-500/10 text-emerald-500 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Buy</span>
                        <span className="text-[8px] opacity-40 font-mono">LONG</span>
                    </button>
                    <button 
                        onClick={() => setOrderType('sell')} 
                        className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${orderType==='sell' ? 'bg-red-500/10 text-red-500 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Sell</span>
                        <span className="text-[8px] opacity-40 font-mono">SHORT</span>
                    </button>
                </div>

                {/* Sub-Types */}
                <div className="grid grid-cols-2 gap-2 mb-8">
                    <button onClick={() => setOrderType(isBuy ? 'buy_limit' : 'sell_limit')} className={`py-1.5 text-[9px] font-bold uppercase rounded-md border transition-all ${orderType.includes('limit') ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/5 text-gray-600 hover:border-white/10'}`}>Limit Order</button>
                    <button onClick={() => setOrderType(isBuy ? 'buy' : 'sell')} className={`py-1.5 text-[9px] font-bold uppercase rounded-md border transition-all ${!orderType.includes('limit') ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/5 text-gray-600 hover:border-white/10'}`}>Market Order</button>
                </div>

                {/* Lot Size & Risk Section */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Position Sizing</span>
                            <div className="flex bg-black border border-white/5 rounded-md p-0.5">
                                <button onClick={() => setLotSizeMode('lots')} className={`px-2 py-1 text-[8px] font-bold rounded ${lotSizeMode === 'lots' ? 'bg-white/10 text-white' : 'text-gray-600'}`}>LOTS</button>
                                <button onClick={() => setLotSizeMode('risk')} className={`px-2 py-1 text-[8px] font-bold rounded ${lotSizeMode === 'risk' ? 'bg-white/10 text-white' : 'text-gray-600'}`}>% RISK</button>
                            </div>
                        </div>

                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-l" />
                            <div className="flex bg-black/60 border border-white/10 rounded-lg overflow-hidden h-12">
                                {lotSizeMode === 'lots' ? (
                                    <>
                                        <button onClick={() => setLotSize(Math.max(0.01, Number((lotSize-0.1).toFixed(2))))} className="px-4 hover:bg-white/5 text-gray-500 hover:text-white transition-colors"><Minus size={14}/></button>
                                        <input type="number" value={lotSize} onChange={e => setLotSize(Number(e.target.value))} className="flex-1 bg-transparent text-center font-mono text-base outline-none text-white selection:bg-blue-500/30" />
                                        <button onClick={() => setLotSize(Number((lotSize+0.1).toFixed(2)))} className="px-4 hover:bg-white/5 text-gray-500 hover:text-white transition-colors"><Plus size={14}/></button>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center px-4 gap-3">
                                        <span className="text-blue-500 font-bold">%</span>
                                        <input type="number" step="0.1" value={riskPercent} onChange={e => setRiskPercent(Number(e.target.value))} className="flex-1 bg-transparent font-mono text-base outline-none text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[10px] font-mono text-gray-600">Calculated Size: <span className="text-gray-300">{calculatedLotSize.toFixed(2)} Lot</span></span>
                            <span className="text-[10px] font-mono text-gray-600">Risk: <span className="text-blue-400">${riskAmount}</span></span>
                        </div>
                    </div>

                    {/* Pending Price */}
                    {orderType.includes('limit') && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Entry Price</span>
                             <div className="bg-black/60 border border-white/10 rounded-lg px-4 py-3 font-mono text-base text-blue-400 flex items-center justify-between">
                                <input type="number" step="0.00001" value={pendingPrice} onChange={e => setPendingPrice(Number(e.target.value))} className="bg-transparent outline-none w-full" />
                                <Zap size={14} className="text-blue-500/50" />
                             </div>
                        </div>
                    )}

                    {/* SL / TP */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="group/param">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Shield size={10} className="text-red-500/50" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stop Loss</span>
                            </div>
                            <div className="bg-black/60 border border-white/10 rounded-lg px-3 py-2.5 flex flex-col group-focus-within/param:border-red-500/30 transition-all">
                                <input type="number" value={slPips} onChange={e => setSlPips(Number(e.target.value))} className="bg-transparent font-mono text-base outline-none text-red-400" />
                                <span className="text-[8px] font-bold text-gray-600 uppercase mt-0.5">PIPS</span>
                            </div>
                        </div>
                        <div className="group/param">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Target size={10} className="text-emerald-500/50" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Take Profit</span>
                            </div>
                            <div className="bg-black/60 border border-white/10 rounded-lg px-3 py-2.5 flex flex-col group-focus-within/param:border-emerald-500/30 transition-all">
                                <input type="number" value={tpPips} onChange={e => setTpPips(Number(e.target.value))} className="bg-transparent font-mono text-base outline-none text-emerald-400" />
                                <span className="text-[8px] font-bold text-gray-600 uppercase mt-0.5">PIPS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Execute Button */}
            <div className="p-6 bg-[#0A0A0A] border-t border-white/5">
                <button 
                    onClick={() => onPlaceOrder(orderType.includes('limit') ? pendingPrice : undefined)} 
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] group overflow-hidden relative ${
                        isBuy 
                        ? 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400' 
                        : 'bg-red-500 text-black shadow-red-500/20 hover:bg-red-400'
                    }`}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Place {orderType.replace('_', ' ')}
                </button>

                <div className="mt-4 flex items-center justify-center gap-4">
                     <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                         <div className="w-1.5 h-1.5 rounded-sm bg-gray-500" />
                         <span className="text-[8px] font-bold uppercase tracking-tighter">One-Click Trading</span>
                     </div>
                </div>
            </div>
        </div>
    );
}
