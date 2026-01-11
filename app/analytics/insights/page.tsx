"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AddSymbolForm } from '@/components/insights/AddSymbolForm';
import { ForecastCard } from '@/components/insights/ForecastCard';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

interface WatchlistItem {
  _id: string;
  symbol: string;
  type: string;
}

export default function InsightsPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        setWatchlist(await res.json());
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAdd = async (symbol: string, type: string) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, type }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setWatchlist(prev => [newItem, ...prev]);
        toast.success(`Added ${symbol} to watchlist`);
      } else if (res.status === 409) {
        toast.error('Symbol already in watchlist');
      } else {
        throw new Error('Failed to add');
      }
    } catch (error) {
       toast.error('Failed to add symbol');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      // Optimistic update
      const prev = [...watchlist];
      setWatchlist(watchlist.filter(item => item._id !== id));

      const res = await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setWatchlist(prev); // Revert
        toast.error('Failed to remove');
      } else {
        toast.success('Removed from watchlist');
      }
    } catch (error) {
      toast.error('Error removing item');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden">
         {/* High-Fidelity Background Architecture */}
         <div className="fixed inset-0 pointer-events-none -z-10 bg-[#050505]">
             <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan-horizontal" />
         </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
            
            {/* HUD System Monitor Header */}
            <header className="flex flex-col items-center justify-center text-center pb-12 border-b border-white/5 mb-12 relative">
                {/* System Status Indicators */}
                <div className="absolute top-0 right-0 py-4 flex flex-col items-end gap-2 pr-4 font-mono">
                    <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Latency:</span>
                         <span className="text-[8px] font-black text-primary uppercase animate-pulse">24ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Sync:</span>
                         <span className="text-[8px] font-black text-emerald-500 uppercase">Stable</span>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 mb-2"
                >
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.8em] italic">Neural Engine // Global Tracking</span>
                    </div>
                    <div className="flex items-center gap-6 text-[8px] font-black text-white/10 uppercase tracking-[0.4em] border-y border-white/5 py-3 px-12 italic">
                         <span>CPU: 12% Utilization</span>
                         <div className="w-1 h-1 rounded-full bg-white/10" />
                         <span>Memory: 4.2GB Cache</span>
                         <div className="w-1 h-1 rounded-full bg-white/10" />
                         <span>Neural Nodes: 128 Active</span>
                    </div>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-8xl md:text-[10rem] font-black tracking-[-0.08em] text-white italic uppercase leading-none mb-4"
                >
                    FORECAST<span className="text-primary/10">.</span>CORE
                </motion.h1>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl text-white/30 text-xs font-bold leading-relaxed tracking-widest uppercase italic border-l-2 border-primary/20 pl-8 mx-auto"
                >
                    <p className="mb-2 text-white/60">Automated Institutional Intelligence Suite</p>
                    Deploying deep-learning models across <span className="text-primary">SMC v4.2</span> / <span className="text-primary">ICT Frameworks</span> / <span className="text-primary">CRT Liquidity Models</span>. 
                    Real-time market architecture scanning and bias convergence mapping.
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-px left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </header>

            {/* Input Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <AddSymbolForm onAdd={handleAdd} />
            </motion.div>

            {/* Content Grid */}
            <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {loading ? (
                    // Skeletons
                    [1,2,3].map(i => (
                        <div key={i} className="h-[300px] rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                    ))
                ) : watchlist.length > 0 ? (
                    watchlist.map((item) => (
                        <ForecastCard 
                            key={item._id}
                            id={item._id}
                            symbol={item.symbol}
                            type={item.type}
                            onRemove={handleRemove}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex p-6 rounded-full bg-white/5 mb-4">
                            <Sparkles className="text-white/20" size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-white/40">Watchlist is empty</h3>
                        <p className="text-white/20 mt-2">Add a symbol above to generate insights.</p>
                    </div>
                )}
            </motion.div>

        </div>
    </div>
  );
}
