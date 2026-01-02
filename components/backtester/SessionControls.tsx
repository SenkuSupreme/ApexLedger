import React, { useState } from "react";
import { 
  Play, Pause, FastForward, SkipBack, Calendar, 
  ChevronRight, Search, Activity, DollarSign, TrendingUp, Settings
} from "lucide-react";
import { SYMBOLS, TIMEFRAMES } from "./constants";
import { Timeframe, AccountStats } from "./types";

import Link from "next/link";

interface SessionControlsProps {
    symbol: string;
    setSymbol: (s: string) => void;
    timeframe: Timeframe;
    setTimeframe: (t: Timeframe) => void;
    isPlaying: boolean;
    setIsPlaying: (p: boolean) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (s: number) => void;
    currentTime: number;
    jumpToDate: (d: string) => void;
    account: AccountStats;
    isLoading?: boolean;
    leverage?: number;
    onBalanceChange?: (balance: number) => void;
    onLeverageChange?: (leverage: number) => void;
}

export default function SessionControls({ 
    symbol, setSymbol, 
    timeframe, setTimeframe, 
    isPlaying, setIsPlaying, 
    playbackSpeed, setPlaybackSpeed,
    currentTime,
    jumpToDate,
    account,
    isLoading,
    leverage = 100,
    onBalanceChange,
    onLeverageChange
}: SessionControlsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    
    const filteredSymbols = SYMBOLS.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentDateStr = new Date((currentTime || Date.now()/1000) * 1000).toISOString().slice(0, 16);

    const leverageOptions = [1, 10, 20, 30, 50, 100, 200, 500];

    return (
        <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-[#0A0A0A] shrink-0">
            <div className="flex items-center gap-4">
                <Link href="/backtester" className="p-2 hover:bg-white/10 rounded-lg transition-colors group" title="Simulation Matrix">
                     <Activity size={18} className="text-gray-500 group-hover:text-blue-500" />
                </Link>
                <div className="h-4 w-px bg-white/10 mx-1" />
                {/* Symbol Selector */}
                <div className="relative group">
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer border border-white/5 hover:border-white/20 transition-all">
                        <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-[10px]">FX</div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xs text-gray-200 leading-none">{SYMBOLS.find(s => s.id === symbol)?.name || symbol}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Instrument</span>
                        </div>
                        <ChevronRight size={14} className="group-hover:rotate-90 transition-transform text-gray-600" />
                    </div>
                    {/* Advanced Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl shadow-black/80 hidden group-hover:block z-[100] overflow-hidden backdrop-blur-md">
                        <div className="p-2 border-b border-white/5">
                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5">
                                <Search size={14} className="text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search instrument..." 
                                    className="bg-transparent text-[11px] text-gray-300 outline-none w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                            {['forex', 'index', 'commodity', 'crypto'].map(group => {
                                const groupSymbols = filteredSymbols.filter(s => s.type === group);
                                if (groupSymbols.length === 0) return null;
                                return (
                                    <div key={group}>
                                        <div className="px-4 py-1.5 text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5">{group}</div>
                                        {groupSymbols.map(s => (
                                            <button 
                                                key={s.id}
                                                onClick={() => { setSymbol(s.id); setSearchTerm(''); }}
                                                className={`w-full text-left px-5 py-2.5 text-xs font-bold hover:bg-blue-500/10 flex items-center justify-between group/item ${symbol === s.id ? 'text-blue-500 bg-blue-500/5' : 'text-gray-400'}`}
                                            >
                                                <span>{s.name}</span>
                                                {symbol === s.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500" />}
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Timeframe Selector */}
                <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                    className="bg-white/5 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/5 outline-none hover:bg-white/10 transition-all cursor-pointer"
                >
                    {TIMEFRAMES.map(tf => <option key={tf} value={tf} className="bg-[#111]">{tf.toUpperCase()}</option>)}
                </select>

                <div className="h-4 w-px bg-white/10" />

                {/* Account Settings Button */}
                <div className="relative">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/5 text-gray-500'}`}
                        title="Account Settings"
                    >
                        <Settings size={16} />
                    </button>
                    
                    {showSettings && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl shadow-black/80 z-[100] overflow-hidden backdrop-blur-md p-4">
                            <div className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Account Configuration</div>
                            
                            {/* Balance Input */}
                            <div className="mb-4">
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Starting Balance</label>
                                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-2">
                                    <DollarSign size={14} className="text-gray-500" />
                                    <input
                                        type="number"
                                        value={account.balance}
                                        onChange={(e) => onBalanceChange?.(Number(e.target.value))}
                                        className="bg-transparent text-sm text-white outline-none w-full font-mono"
                                        min="1000"
                                        step="1000"
                                    />
                                </div>
                            </div>
                            
                            {/* Leverage Selector */}
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Leverage</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {leverageOptions.map(lev => (
                                        <button
                                            key={lev}
                                            onClick={() => onLeverageChange?.(lev)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                                leverage === lev 
                                                    ? 'bg-blue-500 text-black' 
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            1:{lev}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-4 w-px bg-white/10" />

                {/* Date Picker */}
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 group hover:border-white/20 transition-all">
                    <Calendar size={14} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                    <input 
                        type="datetime-local" 
                        value={currentDateStr}
                        onChange={(e) => jumpToDate(e.target.value)}
                        className="bg-transparent text-[10px] font-mono text-gray-300 outline-none [&::-webkit-calendar-picker-indicator]:invert-[0.5] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                <button onClick={() => setIsPlaying(!isPlaying)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isPlaying ? 'bg-red-500/20 text-red-500' : 'bg-blue-500 text-black shadow-lg shadow-blue-500/20'}`}>
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
                <div className="flex items-center gap-1 px-2 border-l border-white/10 ml-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Speed</span>
                    <input 
                        type="range" min="1" max="100" 
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[10px] font-mono text-blue-500 w-8 text-center">{playbackSpeed}x</span>
                </div>
            </div>

            {/* Account Info */}
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Balance</span>
                    <span className="text-sm font-mono font-bold text-emerald-500">${account.balance.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Equity</span>
                    <span className="text-sm font-mono font-bold text-blue-400">${account.equity.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Leverage</span>
                    <span className="text-sm font-mono font-bold text-purple-400">1:{leverage}</span>
                </div>
            </div>
        </div>
    );
}
