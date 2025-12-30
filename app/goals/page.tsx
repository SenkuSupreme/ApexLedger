"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Search,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import GoalCard from "@/components/GoalCard";
import GoalForm from "@/components/GoalForm";
import { IGoal } from "@/lib/models/Goal";
import { toast } from "sonner";

export default function GoalsPage() {
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<IGoal | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        toast.error("Failed to fetch goals");
      }
    } catch (error) {
      toast.error("Error fetching goals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: Partial<IGoal>) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        const newGoal = await response.json();
        setGoals([newGoal, ...goals]);
        setShowGoalForm(false);
        toast.success("Goal created successfully");
      } else {
        toast.error("Failed to create goal");
      }
    } catch (error) {
      toast.error("Error creating goal");
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<IGoal>) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(
          goals.map((goal) => (goal._id === goalId ? updatedGoal : goal))
        );
        setEditingGoal(undefined);
        setShowGoalForm(false);
        toast.success("Goal updated successfully");
      } else {
        toast.error("Failed to update goal");
      }
    } catch (error) {
      toast.error("Error updating goal");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGoals(goals.filter((goal) => goal._id !== goalId));
        toast.success("Goal deleted successfully");
      } else {
        toast.error("Failed to delete goal");
      }
    } catch (error) {
      toast.error("Error deleting goal");
    }
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || goal.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || goal.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: goals.length,
    completed: goals.filter((g) => g.status === "completed").length,
    inProgress: goals.filter((g) => g.status === "in-progress").length,
    avgProgress:
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
          )
        : 0,
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Growth Goals...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Growth Goals
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Track and achieve your trading and personal objectives.
          </p>
        </div>
        <button
          onClick={() => setShowGoalForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
        >
          <Plus size={20} />
          NEW GOAL
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Total Goals
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={20} className="text-green-500" />
            <span className="text-2xl font-bold text-white">
              {stats.completed}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Completed
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 size={20} className="text-yellow-500" />
            <span className="text-2xl font-bold text-white">
              {stats.inProgress}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            In Progress
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={20} className="text-purple-500" />
            <span className="text-2xl font-bold text-white">
              {stats.avgProgress}%
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Avg Progress
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
            placeholder="Search goals..."
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
            <option value="learning">Learning</option>
            <option value="financial">Financial</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => (
          <GoalCard
            key={goal._id}
            goal={goal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            onEdit={(goal) => {
              setEditingGoal(goal);
              setShowGoalForm(true);
            }}
          />
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-white/40 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No goals found
          </h3>
          <p className="text-white/60 mb-4">
            {searchTerm || filterCategory !== "all" || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first goal to start tracking your progress"}
          </p>
          <button
            onClick={() => setShowGoalForm(true)}
            className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Create Goal
          </button>
        </div>
      )}

      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          onSave={
            editingGoal
              ? (updates) => handleUpdateGoal(editingGoal._id!, updates)
              : handleCreateGoal
          }
          onCancel={() => {
            setShowGoalForm(false);
            setEditingGoal(undefined);
          }}
        />
      )}
    </div>
  );
}
