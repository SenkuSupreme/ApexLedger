"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Flame,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle,
  Plus,
} from "lucide-react";
import { IHabit } from "@/lib/models/Habit";
import { toast } from "sonner";

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [habit, setHabit] = useState<IHabit | null>(null);
  const [loading, setLoading] = useState(true);
  const [completionCount, setCompletionCount] = useState(1);
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchHabit(params.id as string);
    }
  }, [params.id]);

  const fetchHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`);
      if (response.ok) {
        const data = await response.json();
        setHabit(data);
      } else {
        toast.error("Failed to fetch habit");
        router.push("/habits");
      }
    } catch (error) {
      toast.error("Error fetching habit");
      router.push("/habits");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!habit) return;

    try {
      const response = await fetch(`/api/habits/${habit._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: completionCount,
          notes: completionNotes,
        }),
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabit(updatedHabit);
        setCompletionCount(1);
        setCompletionNotes("");
        toast.success("Habit completed!");
      } else {
        toast.error("Failed to complete habit");
      }
    } catch (error) {
      toast.error("Error completing habit");
    }
  };

  const handleToggleActive = async () => {
    if (!habit) return;

    try {
      const response = await fetch(`/api/habits/${habit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !habit.isActive }),
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabit(updatedHabit);
        toast.success(`Habit ${habit.isActive ? "paused" : "activated"}`);
      } else {
        toast.error("Failed to update habit");
      }
    } catch (error) {
      toast.error("Error updating habit");
    }
  };

  const handleDelete = async () => {
    if (!habit || !confirm("Are you sure you want to delete this habit?"))
      return;

    try {
      const response = await fetch(`/api/habits/${habit._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Habit deleted successfully");
        router.push("/habits");
      } else {
        toast.error("Failed to delete habit");
      }
    } catch (error) {
      toast.error("Error deleting habit");
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "trading":
        return "text-blue-500 bg-blue-500/20";
      case "health":
        return "text-green-500 bg-green-500/20";
      case "learning":
        return "text-purple-500 bg-purple-500/20";
      case "productivity":
        return "text-yellow-500 bg-yellow-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const isCompletedToday = () => {
    if (!habit) return false;
    const today = new Date().toDateString();
    return habit.completions.some(
      (c) =>
        new Date(c.date).toDateString() === today &&
        c.count >= habit.targetCount
    );
  };

  const getRecentCompletions = () => {
    if (!habit) return [];
    return habit.completions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Habit Details...
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60">
        Habit not found
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/habits")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Habit Details
            </h1>
            <p className="text-white/70 text-sm font-medium">
              Track and manage your habit progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg transition-colors ${
              habit.isActive
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            }`}
          >
            {habit.isActive ? "Pause" : "Activate"}
          </button>
          <button
            onClick={() => router.push(`/habits/${habit._id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Flame size={20} className="text-orange-500" />
            <span className="text-2xl font-bold text-white">
              {habit.streak}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Current Streak
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={20} className="text-green-500" />
            <span className="text-2xl font-bold text-white">
              {habit.longestStreak}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Longest Streak
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-white">
              {habit.targetCount}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Daily Target
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={20} className="text-purple-500" />
            <span className="text-2xl font-bold text-white">
              {habit.completions.length}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Total Completions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Habit Info */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{habit.title}</h2>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(
                    habit.category
                  )}`}
                >
                  {habit.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    habit.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {habit.isActive ? "Active" : "Paused"}
                </span>
              </div>
            </div>

            {habit.description && (
              <p className="text-white/70 mb-6">{habit.description}</p>
            )}

            {/* Complete Today */}
            {habit.isActive && !isCompletedToday() && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">
                  Complete Today
                </h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm text-white/60 mb-2">
                      Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={completionCount}
                      onChange={(e) =>
                        setCompletionCount(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                    />
                  </div>
                  <div className="flex-2">
                    <label className="block text-sm text-white/60 mb-2">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Complete
                  </button>
                </div>
              </div>
            )}

            {isCompletedToday() && (
              <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 text-center">
                <CheckCircle
                  size={24}
                  className="mx-auto text-green-400 mb-2"
                />
                <p className="text-green-400 font-medium">
                  Completed for today! 🎉
                </p>
              </div>
            )}
          </div>

          {/* Recent Completions */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Recent Completions
            </h3>
            <div className="space-y-3">
              {getRecentCompletions().map((completion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-white/40" />
                    <span className="text-white/80">
                      {new Date(completion.date).toLocaleDateString()}
                    </span>
                    <span className="bg-white/10 text-white/60 px-2 py-1 rounded text-xs">
                      {completion.count}x
                    </span>
                  </div>
                  {completion.notes && (
                    <span className="text-white/60 text-sm">
                      {completion.notes}
                    </span>
                  )}
                </div>
              ))}
              {getRecentCompletions().length === 0 && (
                <p className="text-white/40 text-center py-4">
                  No completions yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Properties */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Properties</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Frequency</span>
                <span className="text-white/80 text-sm capitalize">
                  {habit.frequency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Target Count</span>
                <span className="text-white/80 text-sm">
                  {habit.targetCount} per {habit.frequency.slice(0, -2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Created</span>
                <span className="text-white/80 text-sm">
                  {new Date(habit.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Updated</span>
                <span className="text-white/80 text-sm">
                  {new Date(habit.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {habit.tags && habit.tags.length > 0 && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {habit.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
