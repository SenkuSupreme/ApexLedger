"use client";

import React, { useState, useEffect } from "react";
import {
  Microscope,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  BookOpen,
  Star,
  Clock,
  Tag,
  FileText,
  Save,
  X,
} from "lucide-react";

interface ResearchNote {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResearchPage() {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Editor state
  const [editorData, setEditorData] = useState({
    title: "",
    content: "",
    category: "analysis",
    tags: [] as string[],
    isFavorite: false,
  });

  const categories = [
    { id: "all", label: "All Research", color: "bg-white/10" },
    { id: "analysis", label: "Market Analysis", color: "bg-blue-500/20" },
    { id: "strategy", label: "Strategy Research", color: "bg-green-500/20" },
    { id: "economic", label: "Economic Data", color: "bg-purple-500/20" },
    { id: "technical", label: "Technical Analysis", color: "bg-orange-500/20" },
    {
      id: "fundamental",
      label: "Fundamental Analysis",
      color: "bg-red-500/20",
    },
    { id: "ideas", label: "Trading Ideas", color: "bg-yellow-500/20" },
  ];

  // Fetch research notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/research");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to fetch research notes:", error);
      // Mock data for demonstration
      setNotes([
        {
          _id: "1",
          title: "EUR/USD Technical Analysis - Weekly Outlook",
          content:
            "The EUR/USD pair has been consolidating within a tight range of 1.0850-1.0950 over the past week. Key resistance at 1.0950 has held firm, while support at 1.0850 continues to provide a floor for the pair.\n\nTechnical Indicators:\n- RSI: Currently at 52, showing neutral momentum\n- MACD: Slight bullish divergence forming\n- Moving Averages: Price trading between 20 and 50 EMA\n\nUpcoming Events:\n- ECB Meeting Minutes (Thursday)\n- US CPI Data (Friday)\n- German GDP Preliminary (Friday)\n\nTrading Plan:\n- Long above 1.0960 targeting 1.1020\n- Short below 1.0840 targeting 1.0780\n- Risk management: 2% per trade",
          category: "technical",
          tags: ["EURUSD", "technical-analysis", "weekly-outlook"],
          isFavorite: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          _id: "2",
          title: "Federal Reserve Policy Impact on USD Pairs",
          content:
            "Analysis of how recent Fed policy changes are affecting major USD currency pairs and commodities.\n\nKey Points:\n- Hawkish stance supporting USD strength\n- Impact on emerging market currencies\n- Commodity price correlations",
          category: "fundamental",
          tags: ["USD", "federal-reserve", "policy"],
          isFavorite: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
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
    const matchesFavorites = !showFavoritesOnly || note.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Handle editor
  const openEditor = (note?: ResearchNote) => {
    if (note) {
      setEditingNote(note);
      setEditorData({
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        isFavorite: note.isFavorite,
      });
    } else {
      setEditingNote(null);
      setEditorData({
        title: "",
        content: "",
        category: "analysis",
        tags: [],
        isFavorite: false,
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
    setEditorData({
      title: "",
      content: "",
      category: "analysis",
      tags: [],
      isFavorite: false,
    });
  };

  const saveNote = async () => {
    try {
      const method = editingNote ? "PUT" : "POST";
      const url = editingNote
        ? `/api/research/${editingNote._id}`
        : "/api/research";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editorData),
      });

      if (res.ok) {
        fetchNotes();
        closeEditor();
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research note?")) return;

    try {
      const res = await fetch(`/api/research/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const toggleFavorite = async (note: ResearchNote) => {
    try {
      const res = await fetch(`/api/research/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...note, isFavorite: !note.isFavorite }),
      });

      if (res.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !editorData.tags.includes(tag)) {
      setEditorData({
        ...editorData,
        tags: [...editorData.tags, tag],
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditorData({
      ...editorData,
      tags: editorData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Research Hub
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Document your market research and trading analysis
          </p>
        </div>

        <button
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
        >
          <Plus size={18} />
          New Research
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search research..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id} className="bg-black">
              {category.label}
            </option>
          ))}
        </select>

        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
            showFavoritesOnly
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-white/5 text-white/60 hover:text-white border border-white/10"
          }`}
        >
          <Star size={16} />
          Favorites
        </button>
      </div>

      {/* Research Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60">Loading research notes...</p>
          </div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <Microscope size={64} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Research Found
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm || showFavoritesOnly || selectedCategory !== "all"
              ? "Try adjusting your filters"
              : "Start documenting your market research and analysis"}
          </p>
          {!searchTerm && !showFavoritesOnly && selectedCategory === "all" && (
            <button
              onClick={() => openEditor()}
              className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Create Your First Research Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <ResearchCard
              key={note._id}
              note={note}
              onEdit={() => openEditor(note)}
              onDelete={() => deleteNote(note._id)}
              onToggleFavorite={() => toggleFavorite(note)}
              categories={categories}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {editingNote ? "Edit Research" : "New Research"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveNote}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={closeEditor}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editorData.title}
                  onChange={(e) =>
                    setEditorData({ ...editorData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  placeholder="Enter research title..."
                />
              </div>

              {/* Category and Favorite */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Category
                  </label>
                  <select
                    value={editorData.category}
                    onChange={(e) =>
                      setEditorData({ ...editorData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                          className="bg-black"
                        >
                          {category.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorData.isFavorite}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          isFavorite: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/20"
                    />
                    <span className="text-sm text-white/60">
                      Mark as favorite
                    </span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editorData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-white/60 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Content
                </label>
                <textarea
                  value={editorData.content}
                  onChange={(e) =>
                    setEditorData({ ...editorData, content: e.target.value })
                  }
                  className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                  placeholder="Write your research content here..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Research Card Component
function ResearchCard({
  note,
  onEdit,
  onDelete,
  onToggleFavorite,
  categories,
}: {
  note: ResearchNote;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  categories: any[];
}) {
  const category = categories.find((c) => c.id === note.category);
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
            {note.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <span
                className={`px-2 py-1 rounded-full text-xs ${category.color} text-white`}
              >
                {category.label}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-white/40">
              <Clock size={12} />
              {timeAgo(note.updatedAt)}
            </div>
          </div>
        </div>

        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded-lg transition-colors ${
            note.isFavorite
              ? "text-yellow-400"
              : "text-white/40 hover:text-yellow-400"
          }`}
        >
          <Star size={16} fill={note.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content Preview */}
      <p className="text-sm text-white/70 line-clamp-4 mb-4">{note.content}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/5 rounded text-xs text-white/60"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/5 rounded text-xs text-white/40">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-white/40">
          {note.content.length} characters
        </div>

        <div className="flex gap-2">
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
    </div>
  );
}
