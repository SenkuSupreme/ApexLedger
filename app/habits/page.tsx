"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Search,
  Flame,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";
import HabitCard from "@/components/HabitCard";
import HabitForm from "@/components/HabitForm";
import { IHabit } from "@/lib/models/Habit";
import { toast } from "sonner";

export default function HabitsPage() {
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<IHabit | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits");
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      } else {
        toast.error("Failed to fetch habits");
      }
    } catch (error) {
      toast.error("Error fetching habits");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (habitData: Partial<IHabit>) => {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habitData),
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits([newHabit, ...habits]);
        setShowHabitForm(false);
        toast.success("Habit created successfully");
      } else {
        toast.error("Failed to create habit");
      }
    } catch (error) {
      toast.error("Error creating habit");
    }
  };

  const handleUpdateHabit = async (
    habitId: string,
    updates: Partial<IHabit>
  ) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(
          habits.map((habit) => (habit._id === habitId ? updatedHabit : habit))
        );
        setEditingHabit(undefined);
        setShowHabitForm(false);
        toast.success("Habit updated successfully");
      } else {
        toast.error("Failed to update habit");
      }
    } catch (error) {
      toast.error("Error updating habit");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHabits(habits.filter((habit) => habit._id !== habitId));
        toast.success("Habit deleted successfully");
      } else {
        toast.error("Failed to delete habit");
      }
    } catch (error) {
      toast.error("Error deleting habit");
    }
  };

  const handleCompleteHabit = async (
    habitId: string,
    count: number,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, notes }),
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(
          habits.map((habit) => (habit._id === habitId ? updatedHabit : habit))
        );
        toast.success("Habit completed!");
      } else {
        toast.error("Failed to complete habit");
      }
    } catch (error) {
      toast.error("Error completing habit");
    }
  };

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch =
      habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      habit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || habit.category === filterCategory;
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && habit.isActive) ||
      (filterActive === "inactive" && !habit.isActive);
    return matchesSearch && matchesCategory && matchesActive;
  });

  const stats = {
    total: habits.length,
    active: habits.filter((h) => h.isActive).length,
    totalStreak: habits.reduce((sum, h) => sum + h.streak, 0),
    avgStreak:
      habits.length > 0
        ? Math.round(
            habits.reduce((sum, h) => sum + h.streak, 0) / habits.length
          )
        : 0,
    completedToday: habits.filter((h) => {
      const today = new Date().toDateString();
      return h.completions.some(
        (c) =>
          new Date(c.date).toDateString() === today && c.count >= h.targetCount
      );
    }).length,
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Trading Habits...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Trading Habits
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Build consistent habits for trading success.
          </p>
        </div>
        <button
          onClick={() => setShowHabitForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
        >
          <Plus size={20} />
          NEW HABIT
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Total Habits
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={20} className="text-green-500" />
            <span className="text-2xl font-bold text-white">
              {stats.active}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Active
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar size={20} className="text-purple-500" />
            <span className="text-2xl font-bold text-white">
              {stats.completedToday}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Done Today
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Flame size={20} className="text-orange-500" />
            <span className="text-2xl font-bold text-white">
              {stats.totalStreak}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Total Streak
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={20} className="text-yellow-500" />
            <span className="text-2xl font-bold text-white">
              {stats.avgStreak}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Avg Streak
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-white/40" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="trading">Trading</option>
            <option value="health">Health</option>
            <option value="learning">Learning</option>
            <option value="productivity">Productivity</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
          >
            <option value="all">All Habits</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHabits.map((habit) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            onUpdate={handleUpdateHabit}
            onDelete={handleDeleteHabit}
            onEdit={(habit) => {
              setEditingHabit(habit);
              setShowHabitForm(true);
            }}
            onComplete={handleCompleteHabit}
          />
        ))}
      </div>

      {filteredHabits.length === 0 && (
        <div className="text-center py-12">
          <Flame size={48} className="mx-auto text-white/40 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No habits found
          </h3>
          <p className="text-white/60 mb-4">
            {searchTerm || filterCategory !== "all" || filterActive !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first habit to start building consistency"}
          </p>
          <button
            onClick={() => setShowHabitForm(true)}
            className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Create Habit
          </button>
        </div>
      )}

      {showHabitForm && (
        <HabitForm
          habit={editingHabit}
          onSave={
            editingHabit
              ? (updates) => handleUpdateHabit(editingHabit._id!, updates)
              : handleCreateHabit
          }
          onCancel={() => {
            setShowHabitForm(false);
            setEditingHabit(undefined);
          }}
        />
      )}
    </div>
  );
}
