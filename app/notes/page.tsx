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
} from "lucide-react";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

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
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Notes...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Trading Notes
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Capture insights, strategies, and observations
          </p>
        </div>

        <button
          onClick={() => {
            setEditingNote(null);
            setShowEditor(true);
          }}
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-white/5 active:scale-95"
        >
          <Plus size={18} />
          NEW NOTE
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search notes, tags, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <FileText size={32} className="text-white/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Notes Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Start capturing your trading insights and strategies"}
          </p>
          <button
            onClick={() => {
              setEditingNote(null);
              setShowEditor(true);
            }}
            className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl font-bold transition-all"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map((note) => (
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
      )}

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
    const colors = {
      trading: "bg-blue-500/20 text-blue-400",
      analysis: "bg-green-500/20 text-green-400",
      strategy: "bg-purple-500/20 text-purple-400",
      journal: "bg-orange-500/20 text-orange-400",
      general: "bg-gray-500/20 text-gray-400",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {note.isPinned && <Star size={16} className="text-yellow-400" />}
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(
              note.category
            )}`}
          >
            {note.category}
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
        {note.title}
      </h3>

      <p className="text-white/70 text-sm mb-4 line-clamp-3">{note.content}</p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-lg"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-lg">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div>{note.content.length} chars</div>
      </div>
    </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in title and content");
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">
            {note ? "Edit Note" : "Create New Note"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus size={20} className="text-white/60 rotate-45" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  placeholder="Enter note title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                >
                  <option value="general">General</option>
                  <option value="trading">Trading</option>
                  <option value="analysis">Analysis</option>
                  <option value="strategy">Strategy</option>
                  <option value="journal">Journal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                rows={12}
                placeholder="Write your note content here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                placeholder="e.g., EURUSD, strategy, analysis"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) =>
                  setFormData({ ...formData, isPinned: e.target.checked })
                }
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
              />
              <label htmlFor="isPinned" className="text-sm text-white/60">
                Pin this note to the top
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              {note ? "Update" : "Create"} Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
