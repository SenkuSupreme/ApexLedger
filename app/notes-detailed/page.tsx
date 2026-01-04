
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Grid, 
  List as ListIcon, 
  MoreVertical,
  BookOpen,
  Calendar,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotionNoteEditor from "@/components/NotionNoteEditor";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Note {
  _id: string;
  title: string;
  category?: string;
  blocks?: any[];
  isDetailed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotesDetailedPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editingId, setEditingId] = useState<string | null | "new">(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes?isDetailed=true");
      const data = await res.json();
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = (id: string) => {
    setNoteToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await fetch(`/api/notes/${noteToDelete}`, { method: "DELETE" });
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setNoteToDelete(null);
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (editingId) {
    return (
      <NotionNoteEditor
        noteId={editingId === "new" ? undefined : editingId}
        onBack={() => {
          setEditingId(null);
          fetchNotes();
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen pb-20 font-sans text-white">
      {/* Institutional Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-primary/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1200px] h-[1200px] bg-secondary/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Detailed Intel Active</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
              Notes <span className="text-primary/50 text-2xl lg:text-3xl">(Detailed)</span>
            </h1>
            <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
              "Create high-fidelity notes using the same infrastructure as your strategies. Perfect for market reviews, long-form journals, and complex analyses."
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="flex bg-card/60 p-1 rounded-2xl border border-border backdrop-blur-md">
              <button
                onClick={() => setView("grid")}
                className={`p-3 rounded-xl transition-all ${
                  view === "grid" ? "bg-foreground text-background shadow-xl" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-3 rounded-xl transition-all ${
                  view === "list" ? "bg-foreground text-background shadow-xl" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListIcon size={18} />
              </button>
            </div>
            <button
              onClick={() => {
                setEditingId("new");
              }}
              className="group relative flex items-center gap-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground px-8 py-3.5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Plus size={18} className="relative z-10" />
              <span className="relative z-10">New Detailed Note</span>
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="relative group z-10">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors"
          />
          <input
            type="text"
            placeholder="Search detailed notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-card/40 border border-border rounded-3xl text-foreground placeholder:text-muted-foreground text-[11px] font-black uppercase tracking-[0.3em] focus:border-primary/30 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Notes Matrix */}
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10" : "space-y-4 relative z-10"}>
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={note._id}
                onClick={() => setEditingId(note._id)}
                className={
                  view === "grid"
                    ? "group relative bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border p-8 hover:border-primary/30 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col h-[320px] shadow-2xl"
                    : "group flex items-center justify-between bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border p-8 hover:border-primary/30 transition-all cursor-pointer shadow-xl"
                }
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
                
                {view === "grid" ? (
                  <>
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note._id);
                        }}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="relative z-10 flex flex-col h-full space-y-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                              <BookOpen size={18} className="text-muted-foreground group-hover:text-primary-foreground" />
                           </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">
                                 {note.category || "Intel Note"}
                              </span>
                              <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-1 italic">
                                 {note.title}
                              </h3>
                           </div>
                        </div>

                        <div className="space-y-2">
                          {note.blocks && note.blocks.length > 0 ? (
                            note.blocks.filter((b:any) => b.type === 'text' || b.type === 'callout').slice(0, 2).map((b: any, i: number) => (
                              <p key={i} className="text-[11px] text-muted-foreground/60 line-clamp-2 font-medium italic group-hover:text-foreground transition-colors">
                                "{b.content.replace(/<[^>]*>/g, '') || "..."}"
                              </p>
                            ))
                          ) : (
                            <p className="text-[11px] text-muted-foreground/40 italic">No content preview available...</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-3 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
                          <Calendar size={12} className="text-primary/30" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic text-muted-foreground/40">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <MoreVertical size={14} className="text-muted-foreground/10" />
                      </div>
                    </div>
                  </>
                ) : (
                    <div className="flex items-center justify-between w-full relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="w-12 h-12 bg-foreground/5 border border-border rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                          <BookOpen size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors uppercase italic tracking-tighter">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">
                              {note.category || "Intel Note"}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-foreground/20" />
                            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">Modified {new Date(note.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note._id);
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

          {!loading && filteredNotes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full py-40 text-center relative group overflow-hidden bg-foreground/[0.01] border border-dashed border-border rounded-[3.5rem]"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
              <BookOpen size={64} className="text-muted-foreground/40 mx-auto mb-8 relative z-10" />
              <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter italic">No Detailed Notes Found</h3>
              <p className="text-muted-foreground/60 text-[11px] font-black uppercase tracking-[0.4em] mb-12 max-w-sm mx-auto italic leading-relaxed">
                "Start documenting your institutional insights with high-fidelity blocks."
              </p>
              <button
                 onClick={() => {
                   setEditingId("new");
                 }}
                 className="group relative inline-flex items-center gap-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground px-12 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-[0_20px_40px_rgba(var(--foreground),0.1)] active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <Plus size={18} className="relative z-10" />
                <span className="relative z-10">Create Detailed Note</span>
              </button>
            </motion.div>
          )}
        </div>

        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDelete}
          title="Delete Detailed Note?"
          description="This will permanently delete this high-fidelity note. This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
