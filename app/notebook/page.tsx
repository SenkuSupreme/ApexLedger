"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Pin,
  Edit3,
  Trash2,
  Tag,
  Calendar,
  StickyNote,
  BookOpen,
  Lightbulb,
  AlertCircle,
  X,
  Globe,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { formatDistanceToNow } from "date-fns";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  priority: string;
  isQuickNote: boolean;
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "all", label: "All Notes", icon: BookOpen },
  { value: "trading", label: "Trading", icon: StickyNote },
  { value: "strategy", label: "Strategy", icon: Lightbulb },
  { value: "market", label: "Market", icon: Calendar },
  { value: "personal", label: "Personal", icon: Edit3 },
  { value: "idea", label: "Ideas", icon: Lightbulb },
  { value: "lesson", label: "Lessons", icon: BookOpen },
  { value: "other", label: "Other", icon: StickyNote },
];

const COLORS = [
  "hsl(var(--card))", // Card Background (Default)
  "#111111", // Pitch
  "#0D1117", // Midnight
  "#1A1A1A", // Slate
  "#10141D", // Deep Navy
  "#161B22", // Carbon
  "#1C1917", // Stone
  "#1E1B4B", // Deep Indigo
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-gray-400" },
  { value: "medium", label: "Medium", color: "text-yellow-400" },
  { value: "high", label: "High", color: "text-orange-400" },
  { value: "urgent", label: "Urgent", color: "text-red-400" },
];

export default function NotebookPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showQuickNoteForm, setShowQuickNoteForm] = useState(false);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<Note | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "other",
    priority: "medium",
    tags: "",
    color: COLORS[0],
    isPinned: false,
    isQuickNote: false,
  });

  // Fetch notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/notes?${params}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory, searchTerm]);

  // Create or update note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingNote ? `/api/notes/${editingNote._id}` : "/api/notes";
      const method = editingNote ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingNote ? "Note updated" : "Note saved");
        fetchNotes();
        resetForm();
        setIsCreateModalOpen(false);
        setEditingNote(null);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note");
    }
  };

  // Quick note creation
  const handleQuickNote = async (content: string) => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          content,
          category: "other",
          priority: "medium",
          isQuickNote: true,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }),
      });

      if (res.ok) {
        toast.success("Note saved");
        fetchNotes();
        setShowQuickNoteForm(false);
      }
    } catch (error) {
      console.error("Failed to create quick note:", error);
    }
  };

  // Delete note
  const handleDeleteNote = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Note deleted");
        fetchNotes();
        setDeleteConfirmNote(null);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Toggle pin
  const handleTogglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...note, isPinned: !note.isPinned }),
      });

      if (res.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "other",
      priority: "medium",
      tags: "",
      color: COLORS[0],
      isPinned: false,
      isQuickNote: false,
    });
  };

  const openEditModal = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
      tags: note.tags.join(", "),
      color: note.color,
      isPinned: note.isPinned,
      isQuickNote: note.isQuickNote,
    });
    setEditingNote(note);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
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
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-foreground/60">
               <Globe size={10} />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sync Active</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Notebook
          </h1>
          <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Record your market observations, strategy ideas, and psychological insights. Capture every thought before it decays."
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => setShowQuickNoteForm(true)}
            className="group relative flex items-center gap-3 bg-foreground/[0.05] hover:bg-foreground/[0.1] text-muted-foreground hover:text-foreground px-8 py-3.5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-border active:scale-95"
          >
            <Plus size={16} />
            Quick Note
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="group relative flex items-center gap-4 bg-foreground text-background hover:bg-blue-500 hover:text-white px-10 py-3.5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">New Note</span>
          </button>
        </div>
      </div>

      {/* Intelligence Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {[
          { icon: <BookOpen size={18} />, label: "Total Notes", value: notes.length, color: "blue" },
          { icon: <Pin size={18} />, label: "Pinned Notes", value: notes.filter(n => n.isPinned).length, color: "yellow" },
          { icon: <Tag size={18} />, label: "Total Tags", value: Array.from(new Set(notes.flatMap(n => n.tags))).length, color: "purple" },
          { icon: <StickyNote size={18} />, label: "Quick Notes", value: notes.filter(n => n.isQuickNote).length, color: "green" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-8 group hover:bg-card/60 transition-all duration-500 relative overflow-hidden flex flex-col justify-between"
          >
            <div className={`absolute inset-0 bg-${stat.color}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl border border-${stat.color}-500/20 group-hover:bg-foreground group-hover:text-background transition-all text-${stat.color}-500`}>
                 {stat.icon}
              </div>
              <span className="text-4xl font-black italic tracking-tighter text-foreground group-hover:text-foreground transition-colors">{stat.value}</span>
            </div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] group-hover:text-foreground transition-colors relative z-10">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div> */}

      {/* Quick Note Form */}
      <AnimatePresence>
        {showQuickNoteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 overflow-hidden"
          >
            <div className="bg-card/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-10 mb-10 shadow-3xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                   <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Quick Note</h3>
                </div>
                <button
                  onClick={() => setShowQuickNoteForm(false)}
                  className="p-3 bg-foreground/5 text-muted-foreground hover:text-foreground rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formDataArg = new FormData(e.currentTarget);
                  const content = formDataArg.get("content") as string;
                  if (content.trim()) {
                    handleQuickNote(content);
                  }
                }}
                className="space-y-6"
              >
                <textarea
                  name="content"
                  placeholder="Record a quick market observation or thought..."
                  className="w-full h-32 bg-foreground/[0.03] border border-border rounded-3xl px-8 py-6 text-foreground text-sm italic leading-relaxed placeholder:text-muted-foreground/10 resize-none focus:outline-none focus:border-foreground/20 focus:bg-foreground/[0.05] transition-all shadow-inner"
                  autoFocus
                />
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowQuickNoteForm(false)}
                    className="px-8 py-4 bg-foreground/5 text-muted-foreground/40 hover:text-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-4 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-foreground/5"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Mesh */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-10 bg-card/60 border border-border p-6 rounded-[2.5rem] backdrop-blur-xl">
        <div className="relative flex-1 group" id="search-container">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors"
          />
          <input
            type="text"
            placeholder="Search notes and tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-foreground/[0.02] border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/30 text-[11px] font-black uppercase tracking-[0.2em] focus:border-primary/30 focus:outline-none focus:bg-foreground/[0.04] transition-all shadow-inner"
          />
        </div>
        <div className="flex bg-foreground/[0.02] border border-border rounded-2xl p-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? "bg-foreground text-background shadow-xl"
                    : "text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-foreground/5"
                }`}
              >
                <Icon size={14} className={selectedCategory === category.value ? "text-background" : "text-blue-500/60"} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64 text-muted-foreground/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse"
          >
            Loading Notes...
          </motion.div>
        ) : notes.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 relative group z-10"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
            <BookOpen size={64} className="text-muted-foreground/40 mx-auto mb-8 relative z-10" />
            <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter italic">No Notes Found</h3>
            <p className="text-muted-foreground/50 text-[11px] font-black uppercase tracking-[0.4em] mb-12 max-w-sm text-center italic">
              "Your notebook is empty. Create your first note to start recording your thoughts."
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-4 bg-foreground/5 hover:bg-foreground text-muted-foreground/40 hover:text-background px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] border border-border transition-all active:scale-95 backdrop-blur-md"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10"
          >
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={openEditModal}
                onDelete={() => setDeleteConfirmNote(note)}
                onTogglePin={handleTogglePin}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <NoteModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingNote(null);
          resetForm();
        }}
        onSave={handleSaveNote}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingNote}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmNote}
        onClose={() => setDeleteConfirmNote(null)}
        onConfirm={() =>
          deleteConfirmNote && handleDeleteNote(deleteConfirmNote)
        }
        title="Delete Note"
        message={`Delete note "${deleteConfirmNote?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

// Enhanced Note Card Component
function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: () => void;
  onTogglePin: (note: Note) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10, rotateX: 2, rotateY: 2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative bg-card/40 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 hover:border-primary/30 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col h-full shadow-2xl hover:shadow-primary/10"
      style={{ borderLeftColor: note.color, borderLeftWidth: note.color !== COLORS[0] ? '4px' : '1px' }}
      onClick={() => onEdit(note)}
    >
      {/* Mesh Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/[0.02] blur-3xl rounded-full -translate-y-12 translate-x-12 group-hover:bg-blue-500/[0.08] transition-all duration-700" />
      
      {/* Action Header */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          className={`p-2.5 rounded-xl transition-all ${
            note.isPinned 
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
              : "bg-foreground/5 text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          <Pin size={12} fill={note.isPinned ? "currentColor" : "none"} />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="relative z-10 flex flex-col h-full space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-border bg-foreground/5 text-muted-foreground group-hover:border-foreground/20 transition-all`}>
              {note.category}
            </span>
            {note.priority === "urgent" && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          </div>
          <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-2 italic">
            {note.title}
          </h3>
        </div>

        <p className="text-muted-foreground text-[11px] leading-relaxed font-medium line-clamp-4 flex-1 italic group-hover:text-foreground transition-colors duration-500">
          "{note.content}"
        </p>

        <div className="pt-6 border-t border-border flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-foreground/[0.02] border border-border rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover:border-primary/20 group-hover:text-primary transition-all">
                <Tag size={8} />
                {tag}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
              <Calendar size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full bg-foreground/5 group-hover:bg-primary transition-all duration-500`} style={{ backgroundColor: note.color !== COLORS[0] ? note.color : undefined }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Note Modal Component
function NoteModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  isEditing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-foreground">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] -z-10" />
      </div>

      <div className="bg-card/90 border border-border rounded-[3.5rem] p-10 w-full max-w-5xl shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Grain Effect */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-10 border-b border-border pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Note Configuration</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                {isEditing ? "Edit Note" : "New Note"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-4 bg-foreground/5 hover:bg-foreground text-muted-foreground hover:text-background rounded-2xl border border-border transition-all active:scale-95"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>

          <form onSubmit={onSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 p-2">
                {/* Left Column (5 cols) */}
                <div className="lg:col-span-5 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block px-2">Note Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-8 py-6 bg-foreground/[0.03] border border-border rounded-[2rem] text-foreground font-black uppercase italic tracking-tighter focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none shadow-inner text-lg"
                      placeholder="Enter note title..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block px-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-widest focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none cursor-pointer appearance-none shadow-inner"
                      >
                        {CATEGORIES.slice(1).map((category) => (
                          <option key={category.value} value={category.value} className="bg-background">{category.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block px-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-6 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-widest focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none cursor-pointer appearance-none shadow-inner"
                      >
                        {PRIORITIES.map((priority) => (
                          <option key={priority.value} value={priority.value} className="bg-background">{priority.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block px-2">Color Label</label>
                    <div className="flex gap-2 p-2 bg-foreground/[0.02] border border-border rounded-2xl">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color ? "border-foreground scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block px-2">Tags</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20" />
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full pl-14 pr-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground/60 font-medium focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none shadow-inner"
                        placeholder="Tags..."
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                    className={`flex items-center justify-between px-8 py-6 rounded-[2rem] border transition-all w-full group ${
                      formData.isPinned 
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.1)]" 
                        : "bg-foreground/[0.02] border-border text-muted-foreground/20 hover:text-muted-foreground/40 hover:bg-foreground/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Pin size={20} fill={formData.isPinned ? "currentColor" : "none"} className={formData.isPinned ? "animate-pulse" : ""} />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Pin to Top</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${formData.isPinned ? "bg-yellow-500" : "bg-foreground/10"}`} />
                  </button>
                </div>

                {/* Right Column (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block px-2 italic">Note Content</label>
                  <div className="flex-1 relative group h-full">
                    <div className="absolute inset-0 bg-primary/5 blur-[50px] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full h-full min-h-[450px] px-10 py-10 bg-foreground/[0.02] border border-border rounded-[3rem] text-foreground/80 font-medium italic leading-relaxed focus:bg-foreground/[0.04] focus:border-foreground/20 transition-all outline-none resize-none shadow-2xl relative z-10"
                      placeholder="Write your notes, strategy ideas, or observations here..."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-10 border-t border-border mt-auto">
              <button
                type="submit"
                className="flex-1 bg-foreground text-background py-7 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95"
              >
                {isEditing ? "Save Changes" : "Create Note"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-[0.5] bg-foreground/5 text-muted-foreground py-7 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-border hover:bg-foreground/10 hover:text-foreground transition-all active:scale-95"
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
