"use client";

import { useState, useEffect } from "react";
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Grid, 
  List as ListIcon, 
  MoreVertical,
  Activity,
  Zap,
  Cpu,
  Globe,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotionStrategyEditor from "@/components/NotionStrategyEditor";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editingId, setEditingId] = useState<string | null | "new">(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialIsTemplate, setInitialIsTemplate] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strategies");
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

  const handleDelete = (id: string) => {
    setStrategyToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!strategyToDelete) return;
    try {
      await fetch(`/api/strategies?id=${strategyToDelete}`, { method: "DELETE" });
      fetchStrategies();
    } catch (err) {
      console.error(err);
    } finally {
      setStrategyToDelete(null);
    }
  };

  const filteredStrategies = strategies.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (editingId) {
    return (
      <NotionStrategyEditor
        strategyId={editingId === "new" ? undefined : editingId}
        initialIsTemplate={initialIsTemplate}
        onBack={() => {
          setEditingId(null);
          fetchStrategies();
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen pb-20 font-sans text-white">
      {/* Enhanced Institutional Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1400px] h-[1400px] bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-transparent blur-[180px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[1400px] h-[1400px] bg-gradient-to-tr from-secondary/[0.06] via-secondary/[0.03] to-transparent blur-[180px] translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/[0.03] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent/[0.02] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 space-y-12">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/50 pb-12 relative z-10 gap-8">
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="group flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-full backdrop-blur-sm hover:border-primary/50 transition-all">
                <div className="relative">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.6)]" />
                  <div className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping opacity-75" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Strategy Lab Active</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-foreground/[0.04] border border-border/50 rounded-full backdrop-blur-sm hover:border-border transition-all">
                <Globe size={12} className="text-primary/60" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Sync Active</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-foreground/[0.04] border border-border/50 rounded-full backdrop-blur-sm">
                <Database size={12} className="text-accent/60" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{strategies.length} Total</span>
              </div>
            </div>

            {/* Title with enhanced styling */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.02em] uppercase leading-none">
                <span className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent inline-block transform hover:scale-[1.02] transition-transform duration-300">
                  Strategies
                </span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full" />
            </div>

            {/* Enhanced description */}
            <p className="text-foreground/60 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
              Define and organize your trading strategies. Create detailed playbooks to improve your trading consistency and sharpen your edge.
            </p>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-4 relative z-10">
            {/* View Toggle */}
            <div className="flex bg-card/50 p-1.5 rounded-2xl border border-border/50 backdrop-blur-xl shadow-lg">
              <button
                onClick={() => setView("grid")}
                className={`p-3.5 rounded-xl transition-all duration-300 ${
                  view === "grid" 
                    ? "bg-gradient-to-br from-foreground to-foreground/90 text-background shadow-xl scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-3.5 rounded-xl transition-all duration-300 ${
                  view === "list" 
                    ? "bg-gradient-to-br from-foreground to-foreground/90 text-background shadow-xl scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <ListIcon size={18} />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => {
                setInitialIsTemplate(false);
                setEditingId("new");
              }}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/90 text-background hover:from-primary hover:to-primary/90 px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(var(--primary),0.4)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Plus size={18} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">New Strategy</span>
            </button>
          </div>
        </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {[
          { icon: <Layers size={18} />, label: "Active Systems", value: strategies.filter(s => !s.isTemplate).length, color: "sky" },
          { icon: <Database size={18} />, label: "Blueprints", value: strategies.filter(s => s.isTemplate).length, color: "amber" },
          { icon: <Activity size={18} />, label: "Strategy Status", value: "Verified", color: "emerald" },
          { icon: <Cpu size={18} />, label: "System Status", value: "Normal", color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-8 group hover:bg-card/60 transition-all duration-500 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="p-3 bg-foreground/5 border border-border rounded-2xl text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all">
                   {stat.icon}
                </div>
                <span className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-foreground transition-colors">{stat.value}</span>
             </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">
                {stat.label}
              </div>
          </div>
        ))}
      </div> */}

      {/* Enhanced Filter/Search */}
      <div className="relative group z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden group-focus-within:border-primary/30 transition-all duration-300 shadow-lg">
          <Search
            size={20}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
          />
          <input
            type="text"
            placeholder="Search strategies, markets, or instruments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm font-medium tracking-wide focus:outline-none"
          />
        </div>
      </div>

      {/* Strategies Matrix */}
      <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10" : "space-y-4 relative z-10"}>
        <AnimatePresence mode="popLayout">
          {filteredStrategies.map((strategy) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              key={strategy._id}
              onClick={() => setEditingId(strategy._id)}
              className={
                view === "grid"
                  ? "group relative bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl rounded-3xl border border-border/50 p-8 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(var(--primary),0.15)] transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-[340px]"
                  : "group flex items-center justify-between bg-card/40 backdrop-blur-xl rounded-3xl border border-border/50 p-8 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(var(--primary),0.15)] transition-all duration-500 cursor-pointer"
              }
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Subtle noise texture */}
              <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
              
              {view === "grid" ? (
                <>
                  {/* Delete button */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(strategy._id);
                      }}
                      className="p-3 bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-400 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-500/20 backdrop-blur-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="relative z-10 flex flex-col h-full space-y-6">
                    <div className="space-y-5 flex-1">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-foreground/10 to-foreground/5 border border-border/50 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-500">
                            <Layers size={20} className="text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                         </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1.5">
                               {strategy.isTemplate ? "Blueprint" : "Active Strategy"}
                            </span>
                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300 uppercase tracking-tight line-clamp-2 leading-tight">
                               {strategy.name}
                            </h3>
                         </div>
                      </div>

                      {/* Content Preview */}
                      <div className="space-y-3">
                        {strategy.blocks && strategy.blocks.length > 0 ? (
                          <div className="space-y-2">
                            {strategy.blocks
                              .filter((b: any) => b.type === 'text' || b.type === 'callout' || b.type === 'bullet' || b.type === 'number')
                              .slice(0, 2)
                              .map((b: any, i: number) => (
                              <p key={i} className="text-sm text-muted-foreground/70 line-clamp-2 font-medium leading-relaxed group-hover:text-muted-foreground transition-colors duration-300">
                                {b.content.replace(/<[^>]*>/g, '') || "..."}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {strategy.coreInfo?.marketFocus.slice(0, 3).map((m, i) => (
                              <span key={i} className="px-3 py-1.5 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.02] border border-border/50 rounded-xl text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider group-hover:border-primary/30 group-hover:text-primary/80 group-hover:bg-primary/5 transition-all duration-300">
                                {m}
                              </span>
                            ))}
                            {strategy.coreInfo?.marketFocus && strategy.coreInfo.marketFocus.length > 3 && (
                              <span className="px-3 py-1.5 bg-foreground/[0.02] border border-border/50 rounded-xl text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                                +{strategy.coreInfo.marketFocus.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-5 border-t border-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Activity size={14} className="text-primary/40" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">ID: {strategy._id.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Active</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                  <div className="flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="w-12 h-12 bg-foreground/5 border border-border rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                        <Edit3 size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors uppercase italic tracking-tighter">
                          {strategy.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">
                            {strategy.isTemplate ? "Blueprint" : "Active Strategy"}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-foreground/20" />
                          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">Modified {new Date(strategy.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(strategy._id);
                      }}
                      className="p-4 opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-500 rounded-[1.5rem] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="p-4 bg-foreground/5 border border-border rounded-[1.5rem] text-muted-foreground/20">
                      <MoreVertical size={18} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && filteredStrategies.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-full py-32 text-center relative group overflow-hidden bg-gradient-to-br from-card/30 to-card/10 border-2 border-dashed border-border/40 rounded-[3rem] backdrop-blur-sm"
          >
            {/* Animated background orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-accent/5 blur-[80px] rounded-full animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
            
            {/* Content */}
            <div className="relative z-10 space-y-8">
              <div className="inline-flex p-6 bg-gradient-to-br from-foreground/10 to-foreground/5 border border-border/50 rounded-3xl backdrop-blur-sm">
                <Layers size={56} className="text-muted-foreground/40" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-foreground uppercase tracking-tight">No Strategies Found</h3>
                <p className="text-muted-foreground/70 text-base font-medium max-w-md mx-auto leading-relaxed">
                  Your strategy lab is empty. Start by creating a new strategy to begin documenting your trading rules and playbooks.
                </p>
              </div>
              
              <button
                 onClick={() => {
                   setEditingId("new");
                   setInitialIsTemplate(false);
                 }}
                 className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/90 text-background hover:from-primary hover:to-primary/90 px-10 py-5 rounded-full font-black text-sm uppercase tracking-wide transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(var(--primary),0.4)] active:scale-95 overflow-hidden mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">Create Your First Strategy</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Strategy?"
        description="This will permanently delete the strategy blueprint. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      </div>
    </div>
  );
}
