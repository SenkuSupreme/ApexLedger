"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Flame,
  TrendingUp,
  MoreHorizontal,
  CheckCircle,
  Plus,
  Eye,
} from "lucide-react";
import { IHabit } from "@/lib/models/Habit";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface HabitCardProps {
  habit: IHabit;
  onUpdate: (habitId: string, updates: Partial<IHabit>) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: IHabit) => void;
  onComplete: (habitId: string, count: number, notes?: string) => void;
}

const categoryColors = {
  trading: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  health: "bg-green-500/20 text-green-400 border-green-500/30",
  learning: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  productivity: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function HabitCard({
  habit,
  onUpdate,
  onDelete,
  onEdit,
  onComplete,
}: HabitCardProps) {
  const router = useRouter();
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeCount, setCompleteCount] = useState(1);
  const [completeNotes, setCompleteNotes] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCompletion = habit.completions.find(
    (completion) =>
      new Date(completion.date).toDateString() === today.toDateString()
  );

  const isCompletedToday =
    todayCompletion && todayCompletion.count >= habit.targetCount;

  const handleComplete = () => {
    onComplete(habit._id!, completeCount, completeNotes);
    setShowCompleteForm(false);
    setCompleteCount(1);
    setCompleteNotes("");
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-400";
    if (streak >= 14) return "text-blue-400";
    if (streak >= 7) return "text-green-400";
    if (streak >= 3) return "text-yellow-400";
    return "text-white/60";
  };

  const getCompletionRate = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentCompletions = habit.completions.filter(
      (completion) => new Date(completion.date) >= last30Days
    );

    return Math.round((recentCompletions.length / 30) * 100);
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-white tracking-tight">
              {habit.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-lg text-xs border ${
                categoryColors[habit.category]
              }`}
            >
              {habit.category}
            </span>
          </div>
          {!habit.isActive && (
            <div className="mb-3">
              <span className="px-2 py-1 rounded-lg text-xs border bg-red-500/20 text-red-400 border-red-500/30">
                Inactive
              </span>
            </div>
          )}
          {habit.description && (
            <p className="text-sm text-white/60 mb-3">{habit.description}</p>
          )}
        </div>

        <div className="relative group">
          <button className="text-white/40 hover:text-white/60 transition-colors">
            <MoreHorizontal size={16} />
          </button>
          <div className="absolute right-0 top-6 bg-[#0A0A0A] border border-white/20 rounded-lg shadow-xl p-2 hidden group-hover:block z-10 min-w-32">
            <button
              onClick={() => router.push(`/details?type=habit&id=${habit._id}`)}
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white/80 hover:text-white transition-colors flex items-center gap-2"
            >
              <Eye size={14} />
              View Details
            </button>
            <button
              onClick={() => onEdit(habit)}
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white/80 hover:text-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() =>
                onUpdate(habit._id!, { isActive: !habit.isActive })
              }
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white/80 hover:text-white transition-colors"
            >
              {habit.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => setDeleteDialog(true)}
              className="block w-full text-left px-3 py-2 hover:bg-red-500/20 text-red-400 rounded text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div
            className={`flex items-center justify-center gap-1 ${getStreakColor(
              habit.streak
            )}`}
          >
            <Flame size={16} />
            <span className="font-semibold">{habit.streak}</span>
          </div>
          <p className="text-xs text-white/40">Current Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400">
            <TrendingUp size={16} />
            <span className="font-semibold">{habit.longestStreak}</span>
          </div>
          <p className="text-xs text-white/40">Best Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-400">
            <Calendar size={16} />
            <span className="font-semibold">{getCompletionRate()}%</span>
          </div>
          <p className="text-xs text-white/40">30-day Rate</p>
        </div>
      </div>

      {/* Target Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/80">
            Today&apos;s Progress
          </span>
          <span className="text-sm text-white/60">
            {todayCompletion?.count || 0} / {habit.targetCount}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompletedToday ? "bg-green-400" : "bg-white"
            }`}
            style={{
              width: `${Math.min(
                ((todayCompletion?.count || 0) / habit.targetCount) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Action Button */}
      {habit.isActive && (
        <div className="flex gap-2">
          {isCompletedToday ? (
            <div className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 py-3 px-4 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Completed Today
            </div>
          ) : (
            <>
              {!showCompleteForm ? (
                <button
                  onClick={() => setShowCompleteForm(true)}
                  className="flex-1 bg-white text-black py-3 px-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Mark Complete
                </button>
              ) : (
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={completeCount}
                      onChange={(e) =>
                        setCompleteCount(parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-white/20 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={completeNotes}
                      onChange={(e) => setCompleteNotes(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 text-sm focus:border-white/20 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleComplete}
                      className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 py-2 px-3 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => setShowCompleteForm(false)}
                      className="flex-1 bg-white/10 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-white/40 mt-4">
        <div className="flex items-center gap-2">
          <span>{habit.frequency}</span>
          <span>•</span>
          <span>{habit.targetCount}x target</span>
        </div>

        {habit.tags && habit.tags.length > 0 && (
          <div className="flex gap-1">
            {habit.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="bg-white/10 text-white/60 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={() => onDelete(habit._id!)}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
