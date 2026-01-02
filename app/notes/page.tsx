"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Star,
  Calendar,
  Tag,
  BookOpen,
  FileText,
  Clock,
  BarChart3,
  TrendingUp,
  Target,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  category: "trading" | "analysis" | "strategy" | "journal" | "general";
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    note: Note | null;
  }>({ isOpen: false, note: null });

  const categories = [
    { id: "all", label: "All Notes", icon: <FileText size={16} /> },
    { id: "trading", label: "Trading", icon: <BarChart3 size={16} /> },
    { id: "analysis", label: "Analysis", icon: <TrendingUp size={16} /> },
    { id: "strategy", label: "Strategy", icon: <Target size={16} /> },
    { id: "journal", label: "Journal", icon: <BookOpen size={16} /> },
    { id: "general", label: "General", icon: <FileText size={16} /> },
  ];

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      // Mock data for demonstration
      setNotes([
        {
          _id: "1",
          title: "EURUSD Analysis - Weekly Outlook",
          content:
            "Strong bullish momentum after breaking key resistance at 1.0920. ECB hawkish stance supporting the euro. Key levels to watch: Support at 1.0850, Resistance at 1.1000. Risk factors: Fed meeting next week could impact USD strength.",
          tags: ["EURUSD", "weekly-analysis", "bullish"],
          category: "analysis",
          isPinned: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "2",
          title: "Scalping Strategy Rules",
          content:
            "1. Only trade during high volatility sessions (London/NY overlap)\n2. Use 5-minute charts with 15-minute confirmation\n3. Risk max 0.5% per trade\n4. Target 1:2 risk-reward minimum\n5. No more than 3 trades per session\n6. Stop trading after 2 consecutive losses",
          tags: ["scalping", "strategy", "rules"],
          category: "strategy",
          isPinned: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "3",
          title: "Trading Psychology Notes",
          content:
            "Noticed I tend to overtrade when I'm feeling confident after a winning streak. Need to stick to my daily trade limit regardless of how good I feel. Also, revenge trading after losses is still an issue - implement mandatory 30-minute break after any loss.",
          tags: ["psychology", "discipline", "improvement"],
          category: "journal",
          isPinned: false,
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort notes (pinned first, then by updated date)
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotes();
        setDeleteDialog({ isOpen: false, note: null });
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading Notes...
      </div>
    );
  }

  return (
    <div className="space-y-12 text-white font-sans relative min-h-screen pb-20 overflow-hidden">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 relative z-10 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Notes Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/60">
               <Globe size={10} />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sync Active</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
            Notebook
          </h1>
          <p className="text-white/80 text-sm font-medium italic max-w-xl leading-relaxed">
            "Record your market observations, strategy ideas, and psychological insights. Every entry is a step towards mastery."
          </p>
        </div>

        <div className="flex flex-col gap-4 items-end">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Last Transmission</p>
            <p className="text-xs font-mono text-blue-400/60 uppercase">{new Date().toLocaleTimeString()} UTC</p>
          </div>
          <button
            onClick={() => {
              setEditingNote(null);
              setShowEditor(true);
            }}
            className="group relative flex items-center gap-4 bg-white text-black hover:bg-blue-500 hover:text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-blue-500/20 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">New Note</span>
          </button>
        </div>
      </div>

      {/* Intelligence Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {[
          { icon: <FileText size={18} />, label: "Total Notes", value: notes.length, color: "blue" },
          { icon: <Star size={18} />, label: "Pinned Notes", value: notes.filter(n => n.isPinned).length, color: "yellow" },
          { icon: <Tag size={18} />, label: "Total Tags", value: [...new Set(notes.flatMap(n => n.tags))].length, color: "purple" },
          { icon: <Clock size={18} />, label: "Last Updated", value: notes.length > 0 ? new Date(notes[0].updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "--", color: "green" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 group hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden flex flex-col justify-between"
          >
            <div className={`absolute inset-0 bg-${stat.color}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl border border-${stat.color}-500/20 group-hover:bg-black group-hover:text-${stat.color}-500 transition-all text-${stat.color}-500`}>
                 {stat.icon}
              </div>
              <span className="text-4xl font-black italic tracking-tighter text-white/90 group-hover:text-black transition-colors">{stat.value}</span>
            </div>
            <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] group-hover:text-black transition-colors relative z-10">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Institutional Filter Mesh */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-10 bg-white/[0.01] border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-xl">
        <div className="relative flex-1 group">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search notes and tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder:text-white/30 text-[11px] font-black uppercase tracking-[0.2em] focus:border-blue-500/30 focus:outline-none focus:bg-white/[0.04] transition-all shadow-inner"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/[0.02] border border-white/5 rounded-2xl p-1.5 overflow-x-auto custom-scrollbar no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-white text-black shadow-xl"
                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                <span className={selectedCategory === category.id ? "text-black" : "text-blue-500/60"}>
                  {category.icon}
                </span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Content Sector */}
      <AnimatePresence mode="wait">
        {notes.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-40 relative group z-10"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full group-hover:bg-blue-500/10 transition-all duration-700" />
            <div className="relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-[40px] animate-pulse rounded-full" />
               <div className="w-32 h-32 bg-black border border-white/10 rounded-[3rem] flex items-center justify-center relative z-10 shadow-2xl overflow-hidden mb-12">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                  <BookOpen size={48} className="text-blue-500/60" />
               </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">No Notes Found</h3>
            <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.4em] mb-12 max-w-sm text-center leading-relaxed italic">
              "Your notebook is empty. Create your first note to start recording your thoughts."
            </p>
            <button
              onClick={() => {
                setEditingNote(null);
                setShowEditor(true);
              }}
              className="flex items-center gap-4 bg-white/5 hover:bg-white text-white/40 hover:text-black px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] border border-white/10 transition-all active:scale-95 backdrop-blur-md"
            >
              <Plus size={18} />
              Create First Note
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-24 relative z-10"
          >
            {/* Pinned Section */}
            <AnimatePresence>
              {sortedNotes.some(n => n.isPinned) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-10"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-6 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                      <Star size={14} className="text-yellow-500 animate-pulse" fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Pinned Notes</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/20 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedNotes.filter(n => n.isPinned).map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onEdit={() => {
                          setEditingNote(note);
                          setShowEditor(true);
                        }}
                        onDelete={() => setDeleteDialog({ isOpen: true, note })}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Regular Section */}
            <div className="space-y-10">
              {sortedNotes.some(n => n.isPinned) && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                    <FileText size={14} className="text-white/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">All Notes</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
              )}
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {sortedNotes.filter(n => !n.isPinned).map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={() => {
                      setEditingNote(note);
                      setShowEditor(true);
                    }}
                    onDelete={() => setDeleteDialog({ isOpen: true, note })}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Editor Modal */}
      {showEditor && (
        <NoteEditor
          note={editingNote}
          onClose={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
          onSave={() => {
            fetchNotes();
            setShowEditor(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, note: null })}
        onConfirm={() => {
          if (deleteDialog.note) {
            deleteNote(deleteDialog.note._id);
          }
        }}
        title="Delete Note"
        message={`Are you sure you want to delete "${deleteDialog.note?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

// Note Card Component
function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "trading": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "analysis": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "strategy": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "journal": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-gray-400 bg-white/5 border-white/10";
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10, rotateX: 2, rotateY: 2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col h-full shadow-2xl hover:shadow-blue-500/10"
      onClick={onEdit}
    >
      {/* Mesh Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full -translate-y-12 translate-x-12 group-hover:bg-blue-500/[0.08] transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/[0.01] blur-2xl rounded-full translate-y-12 -translate-x-12 group-hover:bg-purple-500/[0.05] transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col h-full space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3">
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border w-fit transition-all duration-500 group-hover:border-white/20 ${getCategoryColor(note.category)}`}>
              {note.category}
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-2 italic">
              {note.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {note.isPinned && (
              <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Star size={14} fill="currentColor" className="animate-pulse" />
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-3 bg-white/5 text-white/20 hover:bg-red-500/10 hover:text-red-500 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <p className="text-white/60 text-[11px] leading-relaxed font-medium line-clamp-4 flex-1 italic group-hover:text-white transition-colors duration-500">
          "{note.content}"
        </p>

        <div className="pt-6 border-t border-white/5 flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] font-black text-white/30 uppercase tracking-widest group-hover:border-blue-500/20 group-hover:text-blue-400 group-hover:bg-blue-500/5 transition-all">
                <Tag size={8} />
                {tag}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white/20 group-hover:text-white/40 transition-colors">
                <Clock size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {new Date(note.updatedAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="w-px h-3 bg-white/5" />
              <div className="flex items-center gap-2 text-white/10 group-hover:text-white/30 transition-colors">
                <BarChart3 size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{note.content.length} SIG</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-white/5 group-hover:bg-blue-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Note Editor Component
function NoteEditor({
  note,
  onClose,
  onSave,
}: {
  note: Note | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: note?.title || "",
    content: note?.content || "",
    category: note?.category || "general",
    tags: note?.tags?.join(", ") || "",
    isPinned: note?.isPinned || false,
  });

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    try {
      const noteData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const url = note ? `/api/notes/${note._id}` : "/api/notes";
      const method = note ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });

      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] -z-10" />
      </div>

      <div className="bg-[#0A0A0A]/90 border border-white/5 rounded-[3.5rem] p-10 w-full max-w-5xl shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Grain Effect */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Background Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] -z-10" />
        </div>

        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Note Settings</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                {note ? "Edit Note" : "New Note"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-4 bg-white/5 hover:bg-white text-white/40 hover:text-black rounded-2xl border border-white/10 transition-all active:scale-95"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 p-2">
                {/* Left Column: Metadata Mesh (5 cols) */}
                <div className="lg:col-span-5 space-y-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block px-2">Note Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-8 py-6 bg-white/[0.03] border border-white/5 rounded-[2rem] text-white font-black uppercase italic tracking-tighter focus:bg-white/[0.06] focus:border-white/20 transition-all outline-none shadow-inner text-lg"
                      placeholder="Enter note title..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block px-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-8 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-black uppercase tracking-widest focus:bg-white/[0.06] focus:border-white/20 transition-all outline-none cursor-pointer appearance-none shadow-inner"
                      >
                        <option value="general">General</option>
                        <option value="trading">Trading</option>
                        <option value="analysis">Analysis</option>
                        <option value="strategy">Strategy</option>
                        <option value="journal">Journal</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block px-2">Tags</label>
                      <div className="relative">
                        <Tag size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full pl-14 pr-8 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-white/60 font-medium focus:bg-white/[0.06] focus:border-white/20 transition-all outline-none shadow-inner"
                          placeholder="Analysis, Edge, Review..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                      className={`flex items-center justify-between px-8 py-6 rounded-[2rem] border transition-all w-full group ${
                        formData.isPinned 
                          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.1)]" 
                          : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white/40 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Star size={20} fill={formData.isPinned ? "currentColor" : "none"} className={formData.isPinned ? "animate-pulse" : ""} />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Pin to Top</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${formData.isPinned ? "bg-yellow-500" : "bg-white/10"}`} />
                    </button>
                  </div>
                </div>

                {/* Right Column: Deep Insight Mesh (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block px-2 italic">Note Content</label>
                  <div className="flex-1 relative group h-full">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[50px] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full h-full min-h-[450px] px-10 py-10 bg-white/[0.02] border border-white/5 rounded-[3rem] text-white/80 font-medium italic leading-relaxed focus:bg-white/[0.04] focus:border-white/20 transition-all outline-none resize-none shadow-2xl relative z-10"
                      placeholder="Write your notes, strategy ideas, or observations here..."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-10 border-t border-white/5 mt-auto">
              <button
                type="submit"
                className="flex-1 bg-white text-black py-7 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-3"
              >
                Save Note
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-[0.5] bg-white/5 text-white/40 py-7 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-white/5 hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
