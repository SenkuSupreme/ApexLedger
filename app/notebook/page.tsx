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
  Archive,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  "#fef3c7", // Yellow
  "#dbeafe", // Blue
  "#dcfce7", // Green
  "#fce7f3", // Pink
  "#f3e8ff", // Purple
  "#fed7d7", // Red
  "#e0f2fe", // Cyan
  "#f0f9ff", // Light blue
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
        fetchNotes();
        resetForm();
        setIsCreateModalOpen(false);
        setEditingNote(null);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
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
        fetchNotes();
        setShowQuickNoteForm(false);
      }
    } catch (error) {
      console.error("Failed to create quick note:", error);
    }
  };

  // Delete note with confirmation dialog
  const handleDeleteNote = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
      if (res.ok) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Notebook
          </h1>
          <p className="text-gray-400 text-sm">
            Capture ideas, strategies, and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuickNoteForm(true)}
            className="flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all"
          >
            <Plus size={18} />
            Quick Note
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-white/5"
          >
            <Plus size={18} />
            NEW NOTE
          </button>
        </div>
      </div>

      {/* Quick Note Form */}
      <AnimatePresence>
        {showQuickNoteForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Quick Note</h3>
              <button
                onClick={() => setShowQuickNoteForm(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const content = formData.get("content") as string;
                if (content.trim()) {
                  handleQuickNote(content);
                }
              }}
              className="space-y-4"
            >
              <textarea
                name="content"
                placeholder="What's on your mind?"
                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:border-white/30"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickNoteForm(false)}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.value
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                <Icon size={16} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white/60 font-mono text-sm">
            Loading notes...
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote size={64} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No notes yet</h3>
          <p className="text-white/60 mb-6">
            Start capturing your trading insights and ideas
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            Create your first note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={openEditModal}
              onDelete={(note) => setDeleteConfirmNote(note)}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}

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
        note={deleteConfirmNote}
        onConfirm={() =>
          deleteConfirmNote && handleDeleteNote(deleteConfirmNote)
        }
        onCancel={() => setDeleteConfirmNote(null)}
      />
    </div>
  );
}

// Enhanced Note Card Component with Folded Paper Design
function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}) {
  const priorityColor =
    PRIORITIES.find((p) => p.value === note.priority)?.color || "text-gray-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative"
    >
      {/* Folded paper effect */}
      <div
        className="relative p-6 rounded-lg shadow-lg transform rotate-1 hover:rotate-0 transition-all duration-300 cursor-pointer min-h-[200px] overflow-hidden"
        style={{
          backgroundColor: note.color,
        }}
        onClick={() => onEdit(note)}
      >
        {/* Folded corner effect */}
        <div
          className="absolute top-0 right-0 w-8 h-8 transform rotate-45 translate-x-4 -translate-y-4"
          style={{
            backgroundColor: note.color,
            filter: "brightness(0.8)",
            clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
          }}
        />

        {/* Shadow for fold */}
        <div
          className="absolute top-0 right-0 w-6 h-6 transform rotate-45 translate-x-3 -translate-y-3 opacity-20"
          style={{
            backgroundColor: "#000",
            clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
          }}
        />

        {/* Pin indicator */}
        {note.isPinned && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10">
            <Pin size={12} className="text-white" />
          </div>
        )}

        {/* Priority indicator */}
        <div
          className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
            note.priority === "urgent"
              ? "bg-red-500"
              : note.priority === "high"
              ? "bg-orange-500"
              : note.priority === "medium"
              ? "bg-yellow-500"
              : "bg-gray-400"
          }`}
        />

        {/* Content */}
        <div className="space-y-3 relative z-10">
          <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">
            {note.title}
          </h3>

          <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
            {note.content}
          </p>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-black/10 text-gray-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs text-gray-600">
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-black/10">
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            <span className="capitalize">{note.category}</span>
          </div>
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note);
            }}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Pin
              size={16}
              className={note.isPinned ? "text-red-500" : "text-gray-600"}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Edit3 size={16} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Note Modal Component (same as before)
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? "Edit Note" : "Create Note"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              placeholder="Enter note title..."
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none focus:outline-none focus:border-white/30"
              placeholder="Write your note content..."
              required
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
              >
                {CATEGORIES.slice(1).map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                    className="bg-black"
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
              >
                {PRIORITIES.map((priority) => (
                  <option
                    key={priority.value}
                    value={priority.value}
                    className="bg-black"
                  >
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              placeholder="trading, strategy, idea..."
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Note Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-white scale-110"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Pin Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) =>
                setFormData({ ...formData, isPinned: e.target.checked })
              }
              className="w-4 h-4 text-white bg-white/5 border-white/10 rounded focus:ring-white/30"
            />
            <label htmlFor="isPinned" className="text-sm text-white/80">
              Pin this note
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              {isEditing ? "Update" : "Create"} Note
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({
  note,
  onConfirm,
  onCancel,
}: {
  note: Note | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!note) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Trash2 size={20} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Delete Note</h3>
        </div>

        <p className="text-white/70 mb-6">
          Are you sure you want to delete "
          <span className="font-medium">{note.title}</span>"? This action cannot
          be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
