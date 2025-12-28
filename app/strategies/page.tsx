
'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, Search, Trash2, Edit3, Grid, List as ListIcon, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotionStrategyEditor from '@/components/NotionStrategyEditor';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Strategy {
  _id: string;
  name: string;
  coreInfo?: {
      marketFocus: string[];
      instrumentFocus: string[];
  };
  blocks?: any[];
  isTemplate?: boolean;
  createdAt: string;
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [editingId, setEditingId] = useState<string | null | 'new'>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [initialIsTemplate, setInitialIsTemplate] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/strategies');
        const data = await res.json();
        setStrategies(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleDelete = async (id: string) => {
      setStrategyToDelete(id);
      setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
      if (!strategyToDelete) return;
      try {
          await fetch(`/api/strategies?id=${strategyToDelete}`, { method: 'DELETE' });
          fetchStrategies();
      } catch (err) {
          console.error(err);
      } finally {
          setStrategyToDelete(null);
      }
  };

  const filteredStrategies = strategies.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (editingId) {
      return (
          <NotionStrategyEditor 
              strategyId={editingId === 'new' ? undefined : editingId} 
              initialIsTemplate={initialIsTemplate}
              onBack={() => {
                  setEditingId(null);
                  fetchStrategies();
              }}
          />
      );
  }

  return (
    <div className="min-h-screen p-8 lg:p-12 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                  <Layers size={20} className="text-sky-500" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Playbook Labs</h1>
          </div>
          <p className="text-white/70 text-sm font-medium tracking-wide">Codify your edge. Architect institutional-grade trading systems.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}
                >
                    <Grid size={18} />
                </button>
                <button 
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}
                >
                    <ListIcon size={18} />
                </button>
            </div>
            <button 
                onClick={() => {
                    setInitialIsTemplate(true);
                    setEditingId('new');
                }} 
                className="px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-2"
            >
                <Plus size={18} /> New Blueprint
            </button>
            <button 
                onClick={() => {
                    setInitialIsTemplate(false);
                    setEditingId('new');
                }} 
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-sky-500/20 flex items-center gap-2"
            >
                <Plus size={18} /> New Strategy
            </button>
        </div>
      </header>

      {/* Search & Stats */}
      <div className="flex items-center gap-6 pb-12 border-b border-white/5">
          <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-sky-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search strategies, markets, or setups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl h-14 pl-12 pr-6 text-sm outline-none focus:ring-1 ring-sky-500/30 text-white transition-all placeholder:text-white/20"
              />
          </div>
          <div className="hidden lg:flex items-center gap-8 px-8 shrink-0">
                <div className="text-center">
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Total Strategies</p>
                    <p className="text-xl font-black text-white">{filteredStrategies.length}</p>
                </div>
                <div className="w-[1px] h-8 bg-white/5" />
                <div className="text-center">
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Grade</p>
                    <p className="text-xl font-black text-emerald-500">A+</p>
                </div>
          </div>
      </div>

      <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-4"}>
        <AnimatePresence mode="popLayout">
            {filteredStrategies.map((strategy) => (
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={strategy._id} 
                onClick={() => setEditingId(strategy._id)}
                className={view === 'grid' ? 
                    "group relative bg-[#0A0A0A] rounded-[2rem] border border-white/10 p-8 hover:border-sky-500/30 hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden" :
                    "group flex items-center justify-between bg-[#0A0A0A] rounded-2xl border border-white/10 p-6 hover:border-sky-500/30 transition-all cursor-pointer"
                }
            >
                {view === 'grid' ? (
                    <>
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(strategy._id); }}
                                className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Edit3 size={20} className="text-sky-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white group-hover:text-sky-500 transition-colors line-clamp-1">{strategy.name}</h3>
                                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Modified {new Date(strategy.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {strategy.blocks && strategy.blocks.length > 0 ? (
                                    strategy.blocks.slice(0, 3).map((b: any, i: number) => (
                                        <p key={i} className="text-[11px] text-white/40 line-clamp-1 font-medium italic">{b.content || '...'}</p>
                                    ))
                                ) : (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {strategy.coreInfo?.marketFocus.map((m, i) => (
                                            <span key={i} className="px-3 py-1 bg-sky-500/5 border border-sky-500/10 rounded-full text-[9px] font-black text-sky-500 uppercase tracking-widest">
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-white/60">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{strategy.isTemplate ? 'Institutional Blueprint' : 'Execution System'}</p>
                                <MoreVertical size={16} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                <Edit3 size={18} className="text-sky-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white group-hover:text-sky-500 transition-colors">{strategy.name}</h3>
                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{strategy.isTemplate ? 'Blueprint' : 'System'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <p className="text-xs font-mono text-white/60 hidden md:block">{new Date(strategy.createdAt).toLocaleDateString()}</p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(strategy._id); }}
                                className="p-2 opacity-0 group-hover:opacity-100 bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
            ))}
        </AnimatePresence>

        {!loading && filteredStrategies.length === 0 && (
          <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.01] animate-in fade-in zoom-in duration-700">
             <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <Layers size={32} className="text-white/10" />
             </div>
             <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">No {showTemplates ? 'Blueprints' : 'Systems'} Found</h3>
             <p className="text-white/60 text-sm max-w-sm mx-auto mb-8 font-medium">Ready to architect your edge? Start by building your first institutional trading framework.</p>
             <button 
                onClick={() => {
                  setEditingId('new');
                  setInitialIsTemplate(showTemplates);
                }}
                className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-2xl"
             >
                Create {showTemplates ? 'Blueprint' : 'System'} 01
             </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Strategy?"
        description="This will permanently delete this strategy. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
