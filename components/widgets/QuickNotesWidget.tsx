"use client";

import React, { useState, useEffect } from "react";
import { StickyNote, Plus, Edit3, Trash2, Pin, X } from "lucide-react";

interface QuickNotesWidgetProps {
  className?: string;
}

export default function QuickNotesWidget({
  className = "",
}: QuickNotesWidgetProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<any>(null);

  // Fetch recent notes
  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes?limit=3");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create quick note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:
            noteContent.slice(0, 50) + (noteContent.length > 50 ? "..." : ""),
          content: noteContent,
          category: "trading",
          priority: "medium",
          isQuickNote: true,
          color: "#fef3c7",
        }),
      });

      if (res.ok) {
        setNoteContent("");
        setShowForm(false);
        fetchNotes(); // Refresh notes
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotes(); // Refresh notes
        setDeleteConfirmNote(null);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Toggle pin
  const handleTogglePin = async (note: any) => {
    try {
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...note, isPinned: !note.isPinned }),
      });

      if (res.ok) {
        fetchNotes(); // Refresh notes
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  return (
    <>
      <div className={`h-full ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Quick Notes</h3>
            <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
              Trading Insights
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus size={16} className="text-white/60" />
          </button>
        </div>

        {/* Quick Note Form */}
        {showForm && (
          <form onSubmit={handleCreateNote} className="mb-4 space-y-3">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Quick trading note..."
              className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm resize-none focus:outline-none focus:border-white/30"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNoteContent("");
                }}
                className="px-3 py-1 text-xs text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-white text-black rounded text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Recent Notes */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note._id}
                className="group relative p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer overflow-hidden"
                style={{
                  backgroundColor: note.color,
                  transform: "rotate(0.5deg)",
                }}
              >
                {/* Folded corner effect */}
                <div
                  className="absolute top-0 right-0 w-4 h-4 transform rotate-45 translate-x-2 -translate-y-2"
                  style={{
                    backgroundColor: note.color,
                    filter: "brightness(0.8)",
                    clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
                  }}
                />

                {/* Pin indicator */}
                {note.isPinned && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <Pin size={8} className="text-white" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {note.title}
                    </h4>
                    <p className="text-xs text-gray-700 line-clamp-2 mt-1">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-600">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      {note.tags && note.tags.length > 0 && (
                        <span className="text-xs text-gray-600">
                          #{note.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note);
                      }}
                      className="p-1 bg-white/80 rounded shadow hover:bg-white transition-colors"
                      title={note.isPinned ? "Unpin" : "Pin"}
                    >
                      <Pin
                        size={12}
                        className={
                          note.isPinned ? "text-red-500" : "text-gray-600"
                        }
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmNote(note);
                      }}
                      className="p-1 bg-white/80 rounded shadow hover:bg-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <StickyNote size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/40">No notes yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-white/60 hover:text-white transition-colors mt-1"
              >
                Create your first note
              </button>
            </div>
          )}
        </div>

        {/* View All Link */}
        {notes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <a
              href="/notebook"
              className="flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
            >
              <Edit3 size={12} />
              View All Notes
            </a>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Note</h3>
            </div>

            <p className="text-white/70 mb-6">
              Are you sure you want to delete "
              <span className="font-medium">{deleteConfirmNote.title}</span>"?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmNote(null)}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirmNote._id)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
