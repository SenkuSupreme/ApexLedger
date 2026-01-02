"use client";

import React, { useState, useEffect } from "react";
import { StickyNote, Plus, Edit3, Trash2, Pin, X } from "lucide-react";
import Link from "next/link";

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
      const res = await fetch("/api/notes?limit=5");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();

    // Listen for global note creation events
    const handleNoteCreated = () => fetchNotes();
    window.addEventListener("noteCreated", handleNoteCreated);

    return () => {
      window.removeEventListener("noteCreated", handleNoteCreated);
    };
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
      <div className={`h-full flex flex-col ${className} group/notes`}>
        {/* Quick Note Input Matrix */}
        <div className="mb-8 relative">
           <div className={`transition-all duration-500 overflow-hidden ${showForm ? "h-40 opacity-100 mb-6" : "h-0 opacity-0 mb-0"}`}>
             <form onSubmit={handleCreateNote} className="space-y-4">
               <textarea
                 value={noteContent}
                 onChange={(e) => setNoteContent(e.target.value)}
                 placeholder="Write a note..."
                 className="w-full h-24 px-4 py-4 bg-foreground/[0.03] border border-border rounded-2xl text-white placeholder-white/20 text-xs font-bold uppercase tracking-wider resize-none focus:outline-none focus:border-white/30 focus:bg-foreground/[0.05] transition-all"
                 autoFocus
               />
               <div className="flex justify-end gap-4">
                 <button
                   type="button"
                   onClick={() => {
                     setShowForm(false);
                     setNoteContent("");
                   }}
                   className="px-4 py-2 text-[10px] font-bold text-foreground/60 dark:text-muted-foreground hover:text-foreground dark:text-foreground uppercase tracking-wider italic transition-all"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-6 py-2 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-foreground transition-all shadow-2xl"
                 >
                   Save Note
                 </button>
               </div>
             </form>
           </div>
           
           {!showForm && (
             <button
               onClick={() => setShowForm(true)}
               className="w-full py-4 border border-dashed border-border rounded-2xl flex items-center justify-center gap-3 text-foreground/60 dark:text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02] hover:border-border transition-all duration-700 group/add"
             >
               <Plus size={14} className="group-hover/add:rotate-90 transition-transform duration-500" />
               <span className="text-[10px] font-bold uppercase tracking-wider italic">Create Note</span>
             </button>
           )}
        </div>

        {/* Recent Notes */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note._id}
                className="group/note relative p-4 bg-foreground/[0.02] border border-border rounded-[1.5rem] hover:bg-white/[0.04] hover:border-border transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.01] blur-2xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                       <div className={`w-1 h-1 rounded-full ${note.isPinned ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-foreground/10"}`} />
                       <span className="text-[10px] font-bold text-foreground/60 dark:text-muted-foreground uppercase tracking-wider italic">
                         {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover/note:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(note);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${note.isPinned ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-foreground/5 border-border text-foreground/40 dark:text-muted-foreground/40 hover:text-foreground hover:border-border"}`}
                      >
                        <Pin size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmNote(note);
                        }}
                        className="p-1.5 bg-foreground/5 border border-border rounded-lg text-foreground/40 dark:text-muted-foreground/40 hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 dark:text-foreground font-medium leading-relaxed italic mb-2 line-clamp-3 group-hover/note:line-clamp-none transition-all">
                    "{note.content}"
                  </p>

                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full">
                       <span className="text-[9px] font-bold text-foreground/50 dark:text-muted-foreground/50 uppercase tracking-wider italic">Trading</span>
                    </div>
                    {note.tags?.length > 0 && (
                      <span className="text-[9px] font-bold text-blue-500/40 uppercase tracking-wider italic">#{note.tags[0]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-8 border border-dashed border-border rounded-[3rem] bg-white/[0.01]">
              <div className="p-4 bg-foreground/[0.03] rounded-2xl mb-6">
                 <StickyNote size={24} className="text-white/10" />
              </div>
              <div className="text-center space-y-2">
                 <p className="text-xs font-bold text-foreground/50 dark:text-muted-foreground/50 uppercase tracking-widest italic">No Notes Found</p>
                 <p className="text-[10px] font-bold text-foreground/40 dark:text-muted-foreground/40 uppercase tracking-wider">Create a new note to get started.</p>
              </div>
            </div>
          )}
        </div>

        {/* Global Archive Link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/notebook"
            className="flex items-center justify-center gap-4 group/link"
          >
             <div className="h-px flex-1 bg-foreground/5 group-hover/link:bg-blue-500/20 transition-all" />
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-foreground/50 dark:text-muted-foreground/50 uppercase tracking-widest group-hover/link:text-white transition-all italic">View All Notes</span>
                <Edit3 size={12} className="text-foreground/40 dark:text-muted-foreground/40 group-hover/link:text-blue-500 transition-all" />
             </div>
             <div className="h-px flex-1 bg-foreground/5 group-hover/link:bg-blue-500/20 transition-all" />
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-[#0A0A0A] border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Note</h3>
            </div>

            <p className="text-foreground/90 dark:text-foreground mb-6">
              Are you sure you want to delete "
              <span className="font-medium">{deleteConfirmNote.title}</span>"?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmNote(null)}
                className="px-4 py-2 text-foreground/80 dark:text-muted-foreground hover:text-foreground transition-colors"
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
