"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Play, Plus, Target } from "lucide-react";

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
  isActive: boolean;
  completionRate: number;
  timesUsed: number;
}

interface ChecklistWidgetProps {
  className?: string;
}

export default function ChecklistWidget({
  className = "",
}: ChecklistWidgetProps) {
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(
    null
  );
  const [currentItems, setCurrentItems] = useState<ChecklistItem[]>([]);
  const [showQuickUse, setShowQuickUse] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch active checklist
  const fetchActiveChecklist = async () => {
    try {
      const res = await fetch("/api/checklists");
      const data = await res.json();
      const active = data.checklists?.find((c: Checklist) => c.isActive);
      setActiveChecklist(active || null);

      if (active) {
        setCurrentItems(
          active.items.map((item: any) => ({ ...item, completed: false }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch active checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveChecklist();
  }, []);

  const toggleItem = (id: string) => {
    setCurrentItems((items: any[]) =>
      items.map((item: any) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const resetChecklist = () => {
    if (activeChecklist) {
      setCurrentItems(
        activeChecklist.items.map((item: any) => ({ ...item, completed: false }))
      );
    }
  };

  const completeChecklist = async () => {
    if (!activeChecklist) return;

    try {
      const res = await fetch(`/api/checklists/${activeChecklist._id}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedItems: currentItems }),
      });

      if (res.ok) {
        // Reset the checklist for next use
        resetChecklist();
        setShowQuickUse(false);
        // Refresh the active checklist to get updated stats
        fetchActiveChecklist();
      } else {
        console.error("Failed to complete checklist:", await res.text());
      }
    } catch (error) {
      console.error("Failed to complete checklist:", error);
    }
  };

  const completedCount = currentItems.filter((item: any) => item.completed).length;
  const completionPercentage =
    currentItems.length > 0
      ? Math.round((completedCount / currentItems.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-white/40 text-sm">Loading checklist...</div>
      </div>
    );
  }

  if (!activeChecklist) {
    return (
      <div className={`h-full ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              Pre-Trade Checklist
            </h3>
            <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
              No Active Checklist
            </p>
          </div>
          <Target size={20} className="text-white/60" />
        </div>

        <div className="text-center py-8">
          <CheckSquare size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/60 mb-4">
            No active checklist found. Create and activate a checklist to use
            this widget.
          </p>
          <a
            href="/checklists"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors text-sm"
          >
            <Plus size={14} />
            Manage Checklists
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Pre-Trade Checklist</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            {activeChecklist.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">
            {activeChecklist.strategy}
          </span>
          <CheckSquare size={20} className="text-white/60" />
        </div>
      </div>

      {!showQuickUse ? (
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/60">Completion Rate</span>
              <span className="text-sm text-white">
                {activeChecklist.completionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-white/60">Times Used</span>
              <span className="text-sm text-white">
                {activeChecklist.timesUsed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Items</span>
              <span className="text-sm text-white">
                {activeChecklist.items.length}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80">Preview:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activeChecklist.items.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-xs text-white/60"
                >
                  <Square size={12} />
                  <span>
                    {index + 1}. {item.text}
                  </span>
                </div>
              ))}
              {activeChecklist.items.length > 3 && (
                <div className="text-xs text-white/40 pl-4">
                  +{activeChecklist.items.length - 3} more items...
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowQuickUse(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <Play size={16} />
            Start Checklist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Progress</span>
            <span className="text-sm text-white">
              {completedCount}/{currentItems.length} ({completionPercentage}%)
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                {item.completed ? (
                  <CheckSquare
                    size={16}
                    className="text-green-400 flex-shrink-0"
                  />
                ) : (
                  <Square size={16} className="text-white/40 flex-shrink-0" />
                )}
                <span className="text-xs text-white/40 w-4">{index + 1}.</span>
                <span
                  className={`text-xs flex-1 ${
                    item.completed ? "text-white/60 line-through" : "text-white"
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={resetChecklist}
              className="flex-1 px-3 py-2 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={completeChecklist}
              disabled={completedCount === 0}
              className="flex-1 px-3 py-2 text-xs bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete ({completionPercentage}%)
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/10">
        <a
          href="/checklists"
          className="flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          <CheckSquare size={12} />
          Manage Checklists
        </a>
      </div>
    </div>
  );
}
