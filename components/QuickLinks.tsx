"use client";

import React, { useState, useEffect } from "react";
import { Plus, Link2, Trash2, Pencil, X, ExternalLink, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QuickLink {
  id: string;
  title: string;
  url: string;
  color: string;
}

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export default function QuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  
  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  useEffect(() => {
    const stored = localStorage.getItem("apex_quick_links");
    if (stored) {
      try {
        setLinks(JSON.parse(stored));
      } catch (e) {
        setLinks([]);
      }
    } else {
      // Default links
      const defaults = [
        { id: "1", title: "TradingView", url: "https://www.tradingview.com", color: "bg-blue-500" },
        { id: "2", title: "ForexFactory", url: "https://www.forexfactory.com", color: "bg-amber-500" },
      ];
      setLinks(defaults);
      localStorage.setItem("apex_quick_links", JSON.stringify(defaults));
    }
  }, []);

  const saveLinks = (updated: QuickLink[]) => {
    setLinks(updated);
    localStorage.setItem("apex_quick_links", JSON.stringify(updated));
  };

  const handleAddOrEdit = () => {
    if (!newTitle || !newUrl) return;

    if (editingLink) {
      const updated = links.map((l) =>
        l.id === editingLink.id
          ? { ...l, title: newTitle, url: newUrl, color: newColor }
          : l
      );
      saveLinks(updated);
    } else {
      const newLink: QuickLink = {
        id: Math.random().toString(36).substring(2, 9),
        title: newTitle,
        url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
        color: newColor,
      };
      saveLinks([...links, newLink]);
    }

    resetForm();
    setIsAddOpen(false);
  };

  const deleteLink = (id: string) => {
    saveLinks(links.filter((l) => l.id !== id));
  };

  const resetForm = () => {
    setNewTitle("");
    setNewUrl("");
    setNewColor(COLORS[0]);
    setEditingLink(null);
  };

  const openEdit = (link: QuickLink) => {
    setEditingLink(link);
    setNewTitle(link.title);
    setNewUrl(link.url);
    setNewColor(link.color);
    setIsAddOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Link Bubbles */}
      <div className="flex items-center -space-x-1">
        {links.map((link) => (
          <div key={link.id} className="relative group">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-7 h-7 rounded-full ${link.color} border-2 border-background flex items-center justify-center text-[10px] font-black text-white shadow-lg hover:scale-125 hover:-translate-y-1 hover:z-20 transition-all duration-300 relative`}
            >
              {link.title[0].toUpperCase()}
            </a>
            
            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-card border border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground whitespace-nowrap opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${link.color}`} />
              {link.title}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogTrigger asChild>
          <button className="w-7 h-7 rounded-full bg-foreground/[0.03] border border-border flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-all ml-2">
            <Plus size={14} />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border text-foreground rounded-3xl p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Link2 size={24} className="text-blue-500" />
              Quick Links
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* List of links */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {links.map((link) => (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-foreground/[0.03] border border-border rounded-2xl group active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${link.color} flex items-center justify-center text-xs font-bold text-white shadow-inner`}>
                        {link.title[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight">{link.title}</span>
                        <span className="text-[10px] text-muted-foreground/60 line-clamp-1 max-w-[150px]">{link.url}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEdit(link)}
                        className="p-2 text-muted-foreground/40 hover:text-blue-400 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => deleteLink(link.id)}
                        className="p-2 text-muted-foreground/40 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {links.length === 0 && (
                <div className="py-10 text-center space-y-3">
                   <div className="w-12 h-12 bg-foreground/[0.03] border border-border rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                      <MousePointer2 size={20} />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">No shortcuts added yet.</p>
                </div>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                resetForm();
                setIsAddOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-foreground/90 transition-all active:scale-[0.98]"
            >
              <Plus size={14} />
              Add New Shortcut
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border border-border text-foreground rounded-3xl p-6 z-[1001]">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
              {editingLink ? "Edit Shortcut" : "New Shortcut"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. TradingView"
                className="w-full bg-foreground/[0.03] border border-border rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">URL</label>
              <div className="relative">
                 <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                 <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="tradingview.com"
                  className="w-full bg-foreground/[0.03] border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Theme Bubble</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-8 h-8 rounded-full ${c} ${
                      newColor === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110 shadow-lg" : "scale-100 opacity-60 hover:opacity-100"
                    } transition-all`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-4 bg-foreground/[0.03] border border-border rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-foreground/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEdit}
                className="flex-1 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-foreground/90 transition-all shadow-xl active:scale-[0.98]"
              >
                {editingLink ? "Save Changes" : "Create Link"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


