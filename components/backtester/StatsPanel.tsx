import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { NewsEvent, Position, AccountStats, Candle } from "./types";
import { calculatePnL } from "./utils";

interface StatsPanelProps {
    positions: Position[];
    account: AccountStats;
    currentCandle: Candle | null;
    onClosePosition: (id: number) => void;
    onPartialClose: (id: number) => void;
    onBE?: (id: number) => void;
    updatePosition?: (id: number, updates: Partial<Position>) => void;
    newsEvents: NewsEvent[];
}

export default function StatsPanel({ positions, account, currentCandle, onClosePosition, onPartialClose, onBE, updatePosition, newsEvents }: StatsPanelProps) {
    const [activeTab, setActiveTab] = useState<'positions' | 'pending' | 'journal' | 'news' | 'performance'>('positions');

    return (
        <div className="h-full border-t border-white/5 bg-[#0A0A0A] flex flex-col">
            <div className="flex items-center gap-1 px-2 border-b border-white/5">
                {['positions', 'pending', 'journal', 'news', 'performance'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-600 hover:text-gray-300'}`}
                    >
                        {tab} {tab === 'positions' && positions.filter(p => p.isOpen && !p.isPending).length > 0 && `(${positions.filter(p => p.isOpen && !p.isPending).length})`}
                    </button>
                ))}
            </div>
            
            <div className="flex-1 overflow-auto scrollbar-hide">
                {activeTab === 'news' ? (
                    <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                         <thead className="text-gray-600 bg-[#0F0F0F] sticky top-0">
                            <tr>
                                <th className="py-2 px-4">Time</th>
                                <th className="py-2 px-4">Impact</th>
                                <th className="py-2 px-4">Event</th>
                                <th className="py-2 px-4">Forecast</th>
                                <th className="py-2 px-4">Actual</th>
                            </tr>
                         </thead>
                          <tbody className="divide-y divide-white/5">
                             {newsEvents.map(e => (
                                 <tr key={e.id} className="hover:bg-white/5">
                                     <td className="py-2 px-4 text-gray-400">{new Date(e.time * 1000).toLocaleString()}</td>
                                     <td className="py-2 px-4">
                                         <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${e.impact === 'high' ? 'bg-red-500/20 text-red-500' : e.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                             {e.impact}
                                         </span>
                                     </td>
                                     <td className="py-2 px-4 font-bold text-gray-100">{e.title}</td>
                                     <td className="py-2 px-4 text-gray-400">{e.forecast}</td>
                                     <td className="py-2 px-4 text-gray-400">{e.actual}</td>
                                 </tr>
                             ))}
                         </tbody>
                    </table>
                ) : activeTab === 'journal' ? (
                     <div className="flex flex-col h-full bg-[#0F0F0F]">
                        {/* Journal Header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#0A0A0A] border-b border-white/5 text-[10px] font-bold uppercase text-gray-500">
                            <div className="w-16">ID</div>
                            <div className="w-24">Date</div>
                            <div className="w-12">Type</div>
                            <div className="w-16 text-right">PnL</div>
                            <div className="w-24 pl-4">Playbook</div>
                            <div className="flex-1 pl-4">Notes</div>
                            <div className="w-32 pl-4">Tags</div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {positions.filter(p => !p.isOpen && !p.isPending).sort((a,b) => (b.exitTime||0) - (a.exitTime||0)).map(p => (
                                <div key={p.id} className="flex items-center px-4 py-2 border-b border-white/5 hover:bg-white/5 text-xs">
                                     <div className="w-16 text-gray-500 font-mono">#{p.id.toString().slice(-4)}</div>
                                     <div className="w-24 text-gray-400 text-[10px]">{p.exitTime ? new Date(p.exitTime*1000).toLocaleString() : '-'}</div>
                                     <div className={`w-12 font-bold ${p.type.includes('buy')?'text-emerald-500':'text-red-500'}`}>{p.type.includes('buy')?'BUY':'SELL'}</div>
                                     <div className={`w-16 text-right font-mono font-bold ${(p.pnl||0)>=0?'text-emerald-400':'text-red-400'}`}>${(p.pnl||0).toFixed(2)}</div>
                                     
                                     {/* Playbook Select */}
                                     <div className="w-24 pl-4">
                                         <select 
                                            value={p.playbook || ''} 
                                            onChange={(e) => updatePosition?.(p.id, { playbook: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded text-[10px] text-gray-300 focus:border-blue-500 outline-none p-1"
                                         >
                                             <option value="">- Setup -</option>
                                             <option value="Breakout">Breakout</option>
                                             <option value="Reversal">Reversal</option>
                                             <option value="Pullback">Pullback</option>
                                             <option value="News">News Fade</option>
                                             <option value="Scalp">Scalp</option>
                                         </select>
                                     </div>

                                     {/* Notes Input */}
                                     <div className="flex-1 pl-4">
                                         <input 
                                            type="text" 
                                            placeholder="Notes..." 
                                            value={p.notes || ''}
                                            onChange={(e) => updatePosition?.(p.id, { notes: e.target.value })}
                                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 text-gray-300 outline-none text-[11px] placeholder-gray-700"
                                         />
                                     </div>

                                     {/* Tags Input */}
                                     <div className="w-32 pl-4">
                                         <input 
                                            type="text" 
                                            placeholder="Tags..." 
                                            value={p.tags?.join(', ') || ''}
                                            onChange={(e) => updatePosition?.(p.id, { tags: e.target.value.split(',').map(s=>s.trim()) })}
                                            className="w-full bg-transparent border border-white/5 rounded px-2 py-0.5 text-[10px] text-gray-400 focus:border-blue-500 outline-none"
                                         />
                                     </div>
                                </div>
                            ))}
                        </div>
                     </div>
                ) : activeTab === 'performance' ? (
                    <div className="p-4 grid grid-cols-4 gap-4 text-xs font-mono">
                        <div className="p-4 bg-white/5 rounded border border-white/5">
                             <div className="text-gray-500 mb-1 uppercase tracking-widest text-[10px]">Total Trades</div>
                             <div className="text-2xl font-bold text-gray-200">{positions.filter(p => !p.isOpen && !p.isPending).length}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded border border-white/5">
                             <div className="text-gray-500 mb-1 uppercase tracking-widest text-[10px]">Win Rate</div>
                             <div className="text-2xl font-bold text-blue-400">
                                 {(() => {
                                     const closed = positions.filter(p => !p.isOpen && !p.isPending);
                                     if(closed.length === 0) return "0.0%";
                                     const wins = closed.filter(p => (p.pnl || 0) > 0).length;
                                     return ((wins / closed.length) * 100).toFixed(1) + "%";
                                 })()}
                             </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded border border-white/5">
                             <div className="text-gray-500 mb-1 uppercase tracking-widest text-[10px]">Profit Factor</div>
                             <div className="text-2xl font-bold text-emerald-400">
                                 {(() => {
                                     const closed = positions.filter(p => !p.isOpen && !p.isPending);
                                     const grossProfit = closed.reduce((acc, p) => acc + ((p.pnl||0) > 0 ? (p.pnl||0) : 0), 0);
                                     const grossLoss = Math.abs(closed.reduce((acc, p) => acc + ((p.pnl||0) < 0 ? (p.pnl||0) : 0), 0));
                                     if(grossLoss === 0) return grossProfit > 0 ? "∞" : "0.00";
                                     return (grossProfit / grossLoss).toFixed(2);
                                 })()}
                             </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded border border-white/5">
                             <div className="text-gray-500 mb-1 uppercase tracking-widest text-[10px]">Net P&L</div>
                             <div className={`text-2xl font-bold ${account.balance >= 100000 ? 'text-emerald-400' : 'text-red-400'}`}>
                                 ${(account.balance - 100000).toFixed(2)}
                             </div>
                        </div>
                        <div className="col-span-2 p-4 bg-white/5 rounded border border-white/5">
                             <div className="text-gray-500 mb-1 uppercase tracking-widest text-[10px]">Best Setup (Playbook)</div>
                             <div className="text-lg font-bold text-gray-300">
                                 {(() => {
                                     const closed = positions.filter(p => !p.isOpen && !p.isPending);
                                     const playbooks: Record<string, number> = {};
                                     closed.forEach(p => {
                                         if(p.playbook) {
                                             playbooks[p.playbook] = (playbooks[p.playbook] || 0) + (p.pnl || 0);
                                         }
                                     });
                                     const best = Object.entries(playbooks).sort((a,b) => b[1] - a[1])[0];
                                     return best ? `${best[0]} (+$${best[1].toFixed(2)})` : "No Data";
                                 })()}
                             </div>
                        </div>
                    </div>
                ) : (
                <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                    <thead className="text-gray-600 bg-[#0F0F0F] sticky top-0">
                        <tr>
                            <th className="py-2 px-4 font-normal">ID</th>
                            <th className="py-2 px-4 font-normal">Time</th>
                            <th className="py-2 px-4 font-normal">Type</th>
                            <th className="py-2 px-4 font-normal">Size</th>
                            <th className="py-2 px-4 font-normal">Entry</th>
                            <th className="py-2 px-4 font-normal">S/L</th>
                            <th className="py-2 px-4 font-normal">T/P</th>
                             <th className="py-2 px-4 font-normal">Current</th>
                            <th className="py-2 px-4 font-normal text-right">Profit</th>
                            <th className="py-2 px-4 font-normal text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {positions
                           .filter(p => {
                               if (activeTab === 'positions') return p.isOpen && !p.isPending;
                               if (activeTab === 'pending') return p.isPending;
                               return !p.isOpen && !p.isPending; // history
                           })
                           .map(p => {
                               const price = currentCandle?.close || 0;
                               // If closed, use stored PnL. If open, calc floating.
                               const currentPnl = p.isOpen 
                                  ? calculatePnL(p.type, p.entryPrice, price, p.lotSize) - p.commission 
                                  : p.pnl;
                               
                               return (
                                <tr key={p.id} className="hover:bg-white/5 group">
                                    <td className="py-2 px-4 text-gray-500">#{p.id.toString().slice(-4)}</td>
                                    <td className="py-2 px-4 text-gray-400">{new Date(p.entryTime * 1000).toLocaleString()}</td>
                                    <td className={`py-2 px-4 font-bold ${p.type.includes('buy') ? 'text-emerald-500' : 'text-red-500'}`}>{p.type.toUpperCase()}</td>
                                    <td className="py-2 px-4 font-bold">{p.lotSize}</td>
                                    <td className="py-2 px-4">{p.entryPrice.toFixed(5)}</td>
                                    <td className="py-2 px-4 text-red-400">{p.slPrice?.toFixed(5) || '-'}</td>
                                    <td className="py-2 px-4 text-emerald-400">{p.tpPrice?.toFixed(5) || '-'}</td>
                                    <td className="py-2 px-4">{p.isOpen ? price.toFixed(5) : p.exitPrice?.toFixed(5)}</td>
                                    <td className={`py-2 px-4 text-right font-bold ${(currentPnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {(currentPnl || 0).toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 text-center flex items-center justify-center gap-2">
                                        {p.isOpen && (
                                            <>
                                                <button onClick={() => onBE?.(p.id)} className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[9px] uppercase text-blue-400 border border-blue-500/20">BE</button>
                                                <button onClick={() => onPartialClose(p.id)} className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[9px] uppercase text-gray-400">50%</button>
                                                <button onClick={() => onClosePosition(p.id)} className="p-1 hover:text-red-500 text-gray-500"><X size={14}/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                               )
                        })}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    );
}
