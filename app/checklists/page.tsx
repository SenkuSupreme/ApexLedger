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
} from "lucide-react";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

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
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(
    null
  );
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStrategy, setFilterStrategy] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    checklist: Checklist | null;
  }>({ isOpen: false, checklist: null });

  // Fetch checklists
  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checklists");
      const data = await res.json();
      setChecklists(data.checklists || []);
    } catch (error) {
      console.error("Failed to fetch checklists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  // Filter checklists
  const filteredChecklists = checklists.filter((checklist) => {
    const matchesSearch =
      checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrategy =
      filterStrategy === "all" || checklist.strategy === filterStrategy;
    return matchesSearch && matchesStrategy;
  });

  // Get unique strategies
  const strategies = [...new Set(checklists.map((c) => c.strategy))];

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Checklists...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Trading Checklists
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Pre-trade validation checklists for different strategies
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
          >
            <Plus size={18} />
            Create Checklist
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search checklists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>

        <select
          value={filterStrategy}
          onChange={(e) => setFilterStrategy(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
        >
          <option value="all">All Strategies</option>
          {strategies.map((strategy) => (
            <option key={strategy} value={strategy}>
              {strategy}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare size={20} className="text-blue-400" />
            <span className="text-sm text-white/60">Total Checklists</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {checklists.length}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-green-400" />
            <span className="text-sm text-white/60">Active Checklists</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {checklists.filter((c) => c.isActive).length}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={20} className="text-purple-400" />
            <span className="text-sm text-white/60">Avg Completion</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {checklists.length > 0
              ? Math.round(
                  checklists.reduce((acc, c) => acc + c.completionRate, 0) /
                    checklists.length
                )
              : 0}
            %
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-orange-400" />
            <span className="text-sm text-white/60">Total Uses</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {checklists.reduce((acc, c) => acc + c.timesUsed, 0)}
          </div>
        </div>
      </div>

      {/* Checklists Grid */}
      {filteredChecklists.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare size={64} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Checklists Found
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm || filterStrategy !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first trading checklist to get started"}
          </p>
          {!searchTerm && filterStrategy === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Create Your First Checklist
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecklists.map((checklist) => (
            <ChecklistCard
              key={checklist._id}
              checklist={checklist}
              onEdit={() => setEditingChecklist(checklist)}
              onDelete={() =>
                setDeleteDialog({
                  isOpen: true,
                  checklist: checklist,
                })
              }
              onDuplicate={() => duplicateChecklist(checklist)}
              onUse={() => setActiveChecklist(checklist)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingChecklist) && (
        <ChecklistModal
          checklist={editingChecklist}
          onClose={() => {
            setShowCreateModal(false);
            setEditingChecklist(null);
          }}
          onSave={(checklist) => {
            if (editingChecklist) {
              updateChecklist(checklist);
            } else {
              createChecklist(checklist);
            }
            setShowCreateModal(false);
            setEditingChecklist(null);
          }}
        />
      )}

      {/* Active Checklist Modal */}
      {activeChecklist && (
        <ActiveChecklistModal
          checklist={activeChecklist}
          onClose={() => setActiveChecklist(null)}
          onComplete={async (completedItems) => {
            try {
              // Update checklist usage statistics
              const completedCount = completedItems.filter(
                (item) => item.completed
              ).length;
              const completionRate = Math.round(
                (completedCount / completedItems.length) * 100
              );

              const response = await fetch(
                `/api/checklists/${activeChecklist._id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    timesUsed: activeChecklist.timesUsed + 1,
                    completionRate: Math.round(
                      (activeChecklist.completionRate *
                        activeChecklist.timesUsed +
                        completionRate) /
                        (activeChecklist.timesUsed + 1)
                    ),
                  }),
                }
              );

              if (response.ok) {
                await fetchChecklists(); // Refresh the list
                setActiveChecklist(null);

                // Show success message
                const successMessage =
                  completionRate === 100
                    ? "Checklist completed successfully! 🎉"
                    : `Checklist completed with ${completionRate}% completion rate.`;

                // You can add a toast notification here if you have one
                console.log(successMessage);
              }
            } catch (error) {
              console.error("Failed to update checklist:", error);
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, checklist: null })}
        onConfirm={() => {
          if (deleteDialog.checklist) {
            deleteChecklist(deleteDialog.checklist._id);
          }
        }}
        title="Delete Checklist"
        message={`Are you sure you want to delete "${deleteDialog.checklist?.name}"? This action cannot be undone.`}
      />
    </div>
  );

  // Helper functions
  async function createChecklist(checklistData: any) {
    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checklistData),
      });
      if (res.ok) {
        fetchChecklists();
      }
    } catch (error) {
      console.error("Failed to create checklist:", error);
    }
  }

  async function updateChecklist(checklistData: any) {
    try {
      const res = await fetch(`/api/checklists/${checklistData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checklistData),
      });
      if (res.ok) {
        fetchChecklists();
      }
    } catch (error) {
      console.error("Failed to update checklist:", error);
    }
  }

  async function deleteChecklist(id: string) {
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchChecklists();
        setDeleteDialog({ isOpen: false, checklist: null });
      }
    } catch (error) {
      console.error("Failed to delete checklist:", error);
    }
  }

  async function duplicateChecklist(checklist: Checklist) {
    const duplicated = {
      ...checklist,
      name: `${checklist.name} (Copy)`,
      _id: undefined,
    };
    createChecklist(duplicated);
  }
}

// Checklist Card Component
function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
}: {
  checklist: Checklist;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUse: () => void;
}) {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            {checklist.name}
          </h3>
          <p className="text-sm text-white/60 mb-2">{checklist.description}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
              {checklist.strategy}
            </span>
            {checklist.isActive && (
              <Star size={14} className="text-yellow-400" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Items</span>
          <span className="text-white">{checklist.items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Completion Rate</span>
          <span className="text-white">{checklist.completionRate}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Times Used</span>
          <span className="text-white">{checklist.timesUsed}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onUse}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <Play size={14} />
          Use
        </button>
        <button
          onClick={onEdit}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={onDuplicate}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// Checklist Modal Component (Create/Edit)
function ChecklistModal({
  checklist,
  onClose,
  onSave,
}: {
  checklist: Checklist | null;
  onClose: () => void;
  onSave: (checklist: any) => void;
}) {
  const [formData, setFormData] = useState(() => ({
    name: checklist?.name || "",
    description: checklist?.description || "",
    strategy: checklist?.strategy || "",
    items: checklist?.items || [
      { id: crypto.randomUUID(), text: "", completed: false },
    ],
    isActive: checklist?.isActive || false,
  }));

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: crypto.randomUUID(), text: "", completed: false },
      ],
    });
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id: string, text: string) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.strategy.trim() ||
      formData.items.length === 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      ...checklist,
      ...formData,
      items: formData.items.filter((item) => item.text.trim()),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">
            {checklist ? "Edit Checklist" : "Create New Checklist"}
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
                  Checklist Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  placeholder="e.g., Scalping Entry Checklist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Strategy *
                </label>
                <input
                  type="text"
                  value={formData.strategy}
                  onChange={(e) =>
                    setFormData({ ...formData, strategy: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  placeholder="e.g., Scalping, Swing Trading"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                rows={3}
                placeholder="Brief description of this checklist..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-white/60">
                  Checklist Items *
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-sm text-white/40 w-6 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                      placeholder="Enter checklist item..."
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
              />
              <label htmlFor="isActive" className="text-sm text-white/60">
                Set as active checklist
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
              {checklist ? "Update" : "Create"} Checklist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Active Checklist Modal Component (For using the checklist)
function ActiveChecklistModal({
  checklist,
  onClose,
  onComplete,
}: {
  checklist: Checklist;
  onClose: () => void;
  onComplete: (completedItems: ChecklistItem[]) => void;
}) {
  const [items, setItems] = useState<ChecklistItem[]>(
    checklist.items.map((item) => ({ ...item, completed: false }))
  );

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((item) => item.completed).length;
  const completionPercentage = Math.round(
    (completedCount / items.length) * 100
  );

  const handleComplete = () => {
    onComplete(items);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">{checklist.name}</h3>
            <p className="text-sm text-white/60">
              {checklist.strategy} Strategy
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus size={20} className="text-white/60 rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Progress</span>
              <span className="text-white">
                {completedCount}/{items.length} ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                {item.completed ? (
                  <CheckSquare
                    size={20}
                    className="text-green-400 flex-shrink-0"
                  />
                ) : (
                  <Square size={20} className="text-white/40 flex-shrink-0" />
                )}
                <span className="text-sm text-white/40 w-6 flex-shrink-0">
                  {index + 1}.
                </span>
                <span
                  className={`flex-1 text-sm ${
                    item.completed ? "text-white/60 line-through" : "text-white"
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={completedCount === 0}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete ({completionPercentage}%)
          </button>
        </div>
      </div>
    </div>
  );
}
