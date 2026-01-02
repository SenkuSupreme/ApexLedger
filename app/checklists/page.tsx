"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Copy,
  Play,
  Target,
  BarChart3,
  Clock,
  Star,
  Search,
  Globe,
  Database,
  Cpu,
  Shield,
  Zap,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  _id: string;
  name: string;
  description: string;
  strategy: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  completionRate: number;
  timesUsed: number;
}

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStrategy, setFilterStrategy] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; checklist: Checklist | null }>({ isOpen: false, checklist: null });
  const [strategies, setStrategies] = useState<any[]>([]);
  const [activeItems, setActiveItems] = useState<ChecklistItem[]>([]);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checklists");
      const data = await res.json();
      setChecklists(data.checklists || []);
    } catch (error) {
      console.error("Failed to fetch checklists:", error);
      toast.error("Failed to load checklists");
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategies = async () => {
    try {
      const res = await fetch("/api/strategies");
      const data = await res.json();
      setStrategies(data || []);
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
    }
  };

  useEffect(() => {
    fetchChecklists();
    fetchStrategies();
  }, []);

  useEffect(() => {
    if (activeChecklist) {
      setActiveItems(activeChecklist.items.map(item => ({ ...item, completed: false })));
    }
  }, [activeChecklist]);

  const toggleActiveItem = (id: string) => {
    setActiveItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completeChecklist = async () => {
    if (!activeChecklist) return;
    
    const completionRate = Math.round((activeItems.filter(i => i.completed).length / activeItems.length) * 100);
    
    try {
      const res = await fetch(`/api/checklists/${activeChecklist._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timesUsed: (activeChecklist.timesUsed || 0) + 1,
          completionRate: completionRate
        })
      });

      if (res.ok) {
        toast.success("Checklist synchronization complete");
        fetchChecklists();
        setActiveChecklist(null);
      }
    } catch (error) {
      toast.error("Failed to synchronize checklist");
    }
  };


  
  const toggleChecklistActive = async (checklist: Checklist) => {
    try {
      // If we are activating this checklist, we should probably deactivate others to ensure only one is active
      // But for now, let's just toggle this one. The widget picks the first active one.
      // Better UX: Deactivate all others first locally or rely on server.
      // Let's just update this one for now.
      
      const res = await fetch(`/api/checklists/${checklist._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Toggle the isActive state
        body: JSON.stringify({ ...checklist, isActive: !checklist.isActive })
      });

      if (res.ok) {
        toast.success(checklist.isActive ? "Protocol deactivated" : "Protocol set as active");
        fetchChecklists();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
       toast.error("Failed to update status");
    }
  };

  const saveChecklist = async (formData: any) => {
    try {
      // Filter out items with empty text
      const cleanedItems = formData.items.filter((item: any) => item.text && item.text.trim().length > 0);
      
      if (cleanedItems.length === 0) {
        toast.error("At least one valid verification item is required");
        return;
      }

      const cleanedFormData = { ...formData, items: cleanedItems };

      const method = editingChecklist ? "PUT" : "POST";
      const url = editingChecklist ? `/api/checklists/${editingChecklist._id}` : "/api/checklists";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedFormData)
      });

      if (res.ok) {
        toast.success(editingChecklist ? "Protocol updated" : "New protocol initialized");
        fetchChecklists();
        setShowCreateModal(false);
        setEditingChecklist(null);
      } else {
        const error = await res.json();
        toast.error(error.error || "Operation failed");
      }
    } catch (error) {
      toast.error("System synchronization failure");
    }
  };

  const filteredChecklists = checklists.filter((checklist) => {
    const matchesSearch = checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) || checklist.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrategy = filterStrategy === "all" || checklist.strategy === filterStrategy;
    return matchesSearch && matchesStrategy;
  });

  const availableStrategies = [...new Set([...strategies.map(s => s.name), ...checklists.map((c) => c.strategy)])];

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-muted-foreground/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading Checklists...
      </div>
    );
  }

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-sky-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Checklists Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-muted-foreground">
               <Shield size={10} className="text-emerald-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Verification Active</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Checklists
          </h1>
          <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Ensure every trade meets your criteria. Remove emotion from your execution by following your predefined verification checklists."
          </p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative flex items-center gap-4 bg-foreground text-background hover:bg-emerald-500 hover:text-foreground px-8 py-3.5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">New Checklist</span>
          </button>
        </div>
      </div>

      {/* Logic Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {[
          { icon: <CheckSquare size={18} />, label: "Checklists", value: checklists.length, color: "blue" },
          { icon: <Target size={18} />, label: "Active Nodes", value: checklists.filter(c => c.isActive).length, color: "emerald" },
          { icon: <BarChart3 size={18} />, label: "Avg Completion", value: `${checklists.length > 0 ? Math.round(checklists.reduce((acc, c) => acc + c.completionRate, 0) / checklists.length) : 0}%`, color: "purple" },
          { icon: <Activity size={18} />, label: "Total Syncs", value: checklists.reduce((acc, c) => acc + c.timesUsed, 0), color: "orange" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-8 group hover:bg-card/60 transition-all duration-500 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="p-3 bg-foreground/5 border border-border rounded-2xl text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all">
                   {stat.icon}
                </div>
                <span className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-foreground transition-colors">{stat.value}</span>
             </div>
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic">
                {stat.label}
             </div>
          </div>
        ))}
      </div> */}

      {/* Filter Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors"
          />
          <input
            type="text"
            placeholder="Search checklists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-card/40 border border-border rounded-[2rem] text-foreground placeholder:text-muted-foreground text-[11px] font-black uppercase tracking-[0.3em] focus:border-primary/30 focus:outline-none transition-all backdrop-blur-md shadow-inner italic"
          />
        </div>

        <select
          value={filterStrategy}
          onChange={(e) => setFilterStrategy(e.target.value)}
          className="px-8 py-5 bg-card/40 border border-border rounded-[2rem] text-foreground text-[10px] font-black uppercase tracking-[0.2em] focus:border-primary/30 focus:outline-none transition-all cursor-pointer hover:bg-card/60 backdrop-blur-md"
        >
          <option value="all" className="bg-background">All Strategies</option>
          {availableStrategies.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
        </select>
      </div>

      {/* Protocol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredChecklists.map((checklist) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={checklist._id}
              className="bg-card/40 backdrop-blur-xl border border-border rounded-[3.5rem] p-10 group hover:border-emerald-500/30 transition-all duration-700 shadow-3xl flex flex-col relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01] pointer-events-none" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 rounded-full italic">
                          {checklist.strategy} Strategy
                       </span>
                       {checklist.isActive && <Star size={12} className="text-amber-500 fill-amber-500 animate-pulse" />}
                    </div>
                    <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">{checklist.name}</h3>
                    <p className="text-[11px] font-medium text-muted-foreground italic mt-3 mb-8 line-clamp-2">"{checklist.description}"</p>
                 </div>
              </div>

              <div className="space-y-4 mb-10 relative z-10">
                 {[
                   { label: "Items", value: checklist.items.length, icon: <Layers size={12} /> },
                   { label: "Completion", value: `${checklist.completionRate}%`, icon: <Activity size={12} /> },
                   { label: "Used", value: checklist.timesUsed, icon: <RefreshCw size={12} /> },
                 ].map((meta, i) => (
                   <div key={i} className="flex justify-between items-center py-3 border-b border-border group-hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="text-muted-foreground/20">{meta.icon}</div>
                         <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic">{meta.label}</span>
                      </div>
                      <span className="text-sm font-black text-foreground italic tabular-nums">{meta.value}</span>
                   </div>
                 ))}
              </div>

              <div className="mt-auto flex gap-3 relative z-10">
                 <button
                   onClick={() => setActiveChecklist(checklist)}
                   className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-foreground text-background rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 hover:text-foreground shadow-xl active:scale-95 italic"
                 >
                   <Play size={14} fill="currentColor" />
                   Review
                 </button>

                  <div className="flex gap-2">
                     <button 
                       onClick={() => toggleChecklistActive(checklist)}
                       className={`p-4 border rounded-2xl transition-all ${checklist.isActive ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-foreground/[0.03] border-border text-muted-foreground/20 hover:text-amber-500 hover:border-amber-500/20"}`}
                       title={checklist.isActive ? "Deactivate" : "Set as Active"}
                     >
                        <Star size={16} fill={checklist.isActive ? "currentColor" : "none"} />
                     </button>
                     <button onClick={() => { setEditingChecklist(checklist); setShowCreateModal(true); }} className="p-4 bg-foreground/[0.03] border border-border rounded-2xl text-muted-foreground/20 hover:bg-foreground hover:text-background transition-all">
                        <Edit3 size={16} />
                     </button>
                     <button onClick={() => setDeleteDialog({ isOpen: true, checklist })} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500/40 hover:bg-red-500 hover:text-foreground transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredChecklists.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full py-40 text-center relative group overflow-hidden bg-foreground/[0.01] border border-dashed border-border rounded-[4rem]"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
          <CheckSquare size={64} className="text-muted-foreground/40 mx-auto mb-10 relative z-10" />
          <h3 className="text-4xl font-black text-foreground mb-6 uppercase tracking-tighter italic">No Protocols Found</h3>
          <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.5em] mb-12 max-w-sm mx-auto italic leading-relaxed">
            "No verifications detected. Initialize your first protocol to begin systematic execution."
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative inline-flex items-center gap-4 bg-foreground text-background hover:bg-emerald-500 hover:text-foreground px-12 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 overflow-hidden border border-border"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">Initialize First Protocol</span>
          </button>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <ChecklistFormModal
            checklist={editingChecklist}
            strategies={availableStrategies}
            onClose={() => { setShowCreateModal(false); setEditingChecklist(null); }}
            onSave={saveChecklist}
          />
        )}
      </AnimatePresence>

      {/* Active Checklist Overlay */}
      <AnimatePresence>
        {activeChecklist && (
          <ChecklistActiveModal
            checklist={activeChecklist}
            items={activeItems}
            onToggle={toggleActiveItem}
            onClose={() => setActiveChecklist(null)}
            onComplete={completeChecklist}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, checklist: null })}
        onConfirm={() => {
          if (deleteDialog.checklist) {
            deleteChecklist(deleteDialog.checklist._id);
          }
        }}
        title="Destroy Protocol"
        message={`Are you sure you want to delete "${deleteDialog.checklist?.name}"? All data for this artifact will be permanently purged.`}
      />
    </div>
  );

  async function deleteChecklist(id: string) {
    try {
      const res = await fetch(`/api/checklists/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Protocol purged from archive");
        fetchChecklists();
        setDeleteDialog({ isOpen: false, checklist: null });
      }
    } catch (error) {
      console.error("Failed to delete checklist:", error);
    }
  }
}

// Sub-components
function ChecklistFormModal({ checklist, strategies, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: checklist?.name || "",
    description: checklist?.description || "",
    strategy: checklist?.strategy || strategies[0] || "",
    items: checklist?.items || [{ id: Date.now().toString(), text: "", completed: false }],
    isActive: checklist?.isActive || false
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), text: "", completed: false }]
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((i: any) => i.id !== id)
    }));
  };

  const updateItem = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((i: any) => i.id === id ? { ...i, text } : i)
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 shadow-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
          {checklist ? "Calibrate Protocol" : "New Protocol"}
        </h2>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide py-2">
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic ml-1">Protocol Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-foreground/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:border-emerald-500/50 outline-none transition-all italic font-medium" />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic ml-1">Strategy Focus</label>
                <input list="strategies" value={formData.strategy} onChange={e => setFormData({...formData, strategy: e.target.value})} className="w-full bg-foreground/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:border-emerald-500/50 outline-none transition-all italic font-medium" />
                <datalist id="strategies">
                   {strategies.map((s: string) => <option key={s} value={s} />)}
                </datalist>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic ml-1">Archive Description</label>
             <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-foreground/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:border-emerald-500/50 outline-none transition-all italic font-medium min-h-[100px]" />
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic ml-1">Verification Items</label>
                <button onClick={addItem} className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-foreground transition-colors bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">Add Node</button>
             </div>
             <div className="space-y-3">
                {formData.items.map((item: any, idx: number) => (
                  <div key={item.id} className="flex gap-3 group">
                    <div className="flex-1 relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10">{String(idx+1).padStart(2, '0')}</span>
                       <input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="w-full bg-foreground/[0.03] border border-border rounded-2xl pl-12 pr-6 py-3.5 text-[11px] font-medium text-foreground italic focus:border-emerald-500/30 outline-none transition-all" placeholder="Enter verification metric..." />
                    </div>
                    {formData.items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="p-3 text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
           <button onClick={onClose} className="flex-1 h-16 bg-foreground/[0.03] border border-border text-white/40 font-black uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-foreground/[0.06] transition-all italic text-[10px]">Cancel</button>
           <button onClick={() => onSave(formData)} className="flex-1 h-16 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-emerald-500 hover:text-foreground transition-all shadow-2xl italic text-[10px]">Initialize</button>
        </div>
      </motion.div>
    </div>
  );
}

function ChecklistActiveModal({ checklist, items, onToggle, onClose, onComplete }: any) {
  const completedCount = items.filter((i: any) => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
      <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative w-full max-w-xl bg-black border border-white/10 rounded-[4rem] p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        
        <div className="mb-12 relative z-10 text-center">
           <div className="inline-flex gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <Activity size={12} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Execution Active</span>
           </div>
           <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-3">{checklist.name}</h2>
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 italic">Protocol Verification Process</p>
        </div>

        <div className="space-y-4 mb-12 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide py-2">
           {items.map((item: any) => (
             <div 
               key={item.id} 
               onClick={() => onToggle(item.id)}
               className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all cursor-pointer group ${
                 item.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-border hover:border-white/10'
               }`}
             >
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                  item.completed ? 'bg-emerald-500 border-emerald-500 text-foreground shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10 text-muted-foreground/20'
                }`}>
                   <CheckSquare size={16} className={item.completed ? 'opacity-100' : 'opacity-0'} />
                </div>
                <span className={`text-sm font-black italic transition-colors ${item.completed ? 'text-white' : 'text-white/40'}`}>
                   {item.text}
                </span>
             </div>
           ))}
        </div>

        <div className="relative z-10">
           <div className="flex justify-between items-end mb-4 px-2">
              <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest italic">Node Synchronization</span>
              <span className="text-2xl font-black text-emerald-400 italic tabular-nums">{progress}%</span>
           </div>
           <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-12">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
           </div>

           <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 h-16 bg-foreground/[0.03] border border-border rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Abort</button>
              <button 
                onClick={onComplete}
                disabled={progress < 100}
                className={`flex-1 h-16 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all italic shadow-2xl ${
                  progress === 100 ? 'bg-white text-black hover:bg-emerald-500 hover:text-white' : 'bg-white/10 text-muted-foreground/20 cursor-not-allowed'
                }`}
              >
                Sync Protocol
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

// Minimal icons for metadata
function Layers({ size }: { size: number }) { return <Database size={size} /> }
function RefreshCw({ size }: { size: number }) { return <Zap size={size} /> }
