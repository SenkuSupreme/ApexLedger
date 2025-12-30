"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Plus,
  Minus,
} from "lucide-react";
import { IGoal } from "@/lib/models/Goal";
import { toast } from "sonner";

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [goal, setGoal] = useState<IGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchGoal(params.id as string);
    }
  }, [params.id]);

  const fetchGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`);
      if (response.ok) {
        const data = await response.json();
        setGoal(data);
      } else {
        toast.error("Failed to fetch goal");
        router.push("/goals");
      }
    } catch (error) {
      toast.error("Error fetching goal");
      router.push("/goals");
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    if (!goal) return;

    try {
      const response = await fetch(`/api/goals/${goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: Math.max(0, Math.min(100, newProgress)),
        }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoal(updatedGoal);
        toast.success("Progress updated");
      } else {
        toast.error("Failed to update progress");
      }
    } catch (error) {
      toast.error("Error updating progress");
    }
  };

  const handleStatusChange = async (
    newStatus: "not-started" | "in-progress" | "completed" | "paused"
  ) => {
    if (!goal) return;

    try {
      const response = await fetch(`/api/goals/${goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoal(updatedGoal);
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleMilestoneToggle = async (milestoneIndex: number) => {
    if (!goal) return;

    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      completed: !updatedMilestones[milestoneIndex].completed,
      completedAt: !updatedMilestones[milestoneIndex].completed
        ? new Date()
        : undefined,
    };

    try {
      const response = await fetch(`/api/goals/${goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones: updatedMilestones }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoal(updatedGoal);
        toast.success("Milestone updated");
      } else {
        toast.error("Failed to update milestone");
      }
    } catch (error) {
      toast.error("Error updating milestone");
    }
  };

  const handleAddMilestone = async () => {
    if (!goal || !newMilestone.trim()) return;

    const updatedMilestones = [
      ...goal.milestones,
      { title: newMilestone.trim(), completed: false },
    ];

    try {
      const response = await fetch(`/api/goals/${goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones: updatedMilestones }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoal(updatedGoal);
        setNewMilestone("");
        toast.success("Milestone added");
      } else {
        toast.error("Failed to add milestone");
      }
    } catch (error) {
      toast.error("Error adding milestone");
    }
  };

  const handleRemoveMilestone = async (milestoneIndex: number) => {
    if (!goal) return;

    const updatedMilestones = goal.milestones.filter(
      (_, index) => index !== milestoneIndex
    );

    try {
      const response = await fetch(`/api/goals/${goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones: updatedMilestones }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoal(updatedGoal);
        toast.success("Milestone removed");
      } else {
        toast.error("Failed to remove milestone");
      }
    } catch (error) {
      toast.error("Error removing milestone");
    }
  };

  const handleDelete = async () => {
    if (!goal || !confirm("Are you sure you want to delete this goal?")) return;

    try {
      const response = await fetch(`/api/goals/${goal._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Goal deleted successfully");
        router.push("/goals");
      } else {
        toast.error("Failed to delete goal");
      }
    } catch (error) {
      toast.error("Error deleting goal");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/20";
      case "low":
        return "text-green-500 bg-green-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/20";
      case "in-progress":
        return "text-blue-500 bg-blue-500/20";
      case "paused":
        return "text-yellow-500 bg-yellow-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "trading":
        return "text-blue-500 bg-blue-500/20";
      case "learning":
        return "text-purple-500 bg-purple-500/20";
      case "financial":
        return "text-green-500 bg-green-500/20";
      case "personal":
        return "text-pink-500 bg-pink-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const completedMilestones =
    goal?.milestones.filter((m) => m.completed).length || 0;
  const totalMilestones = goal?.milestones.length || 0;

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Goal Details...
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60">
        Goal not found
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/goals")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Goal Details
            </h1>
            <p className="text-white/70 text-sm font-medium">
              Track and manage your goal progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/goals/${goal._id}/edit`)}
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
            <TrendingUp size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-white">
              {goal.progress}%
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Progress
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-2xl font-bold text-white">
              {completedMilestones}/{totalMilestones}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Milestones
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target size={20} className="text-purple-500" />
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${getPriorityColor(
                goal.priority
              )}`}
            >
              {goal.priority.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Priority
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar size={20} className="text-yellow-500" />
            <span className="text-sm font-bold text-white">
              {goal.targetDate
                ? new Date(goal.targetDate).toLocaleDateString()
                : "No date"}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Target Date
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goal Info */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{goal.title}</h2>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(
                    goal.category
                  )}`}
                >
                  {goal.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                    goal.status
                  )}`}
                >
                  {goal.status.replace("-", " ")}
                </span>
              </div>
            </div>

            {goal.description && (
              <p className="text-white/70 mb-6">{goal.description}</p>
            )}

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Progress</span>
                <span className="text-sm text-white/80">{goal.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            {/* Progress Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => handleProgressUpdate(goal.progress - 5)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                disabled={goal.progress <= 0}
              >
                <Minus size={16} />
                -5%
              </button>
              <button
                onClick={() => handleProgressUpdate(goal.progress + 5)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                disabled={goal.progress >= 100}
              >
                <Plus size={16} />
                +5%
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => handleProgressUpdate(Number(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Status Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange("not-started")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  goal.status === "not-started"
                    ? "bg-gray-500/20 text-gray-300"
                    : "bg-white/10 hover:bg-white/20 text-white/70"
                }`}
                disabled={goal.status === "not-started"}
              >
                Not Started
              </button>
              <button
                onClick={() => handleStatusChange("in-progress")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  goal.status === "in-progress"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-white/10 hover:bg-white/20 text-white/70"
                }`}
                disabled={goal.status === "in-progress"}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  goal.status === "completed"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-white/10 hover:bg-white/20 text-white/70"
                }`}
                disabled={goal.status === "completed"}
              >
                Completed
              </button>
              <button
                onClick={() => handleStatusChange("paused")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  goal.status === "paused"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-white/10 hover:bg-white/20 text-white/70"
                }`}
                disabled={goal.status === "paused"}
              >
                Paused
              </button>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Milestones</h3>

            {/* Add Milestone */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Add new milestone..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                onKeyPress={(e) => e.key === "Enter" && handleAddMilestone()}
              />
              <button
                onClick={handleAddMilestone}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                disabled={!newMilestone.trim()}
              >
                Add
              </button>
            </div>

            {/* Milestone List */}
            <div className="space-y-3">
              {goal.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleMilestoneToggle(index)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {milestone.completed ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <span
                      className={`${
                        milestone.completed
                          ? "text-white/60 line-through"
                          : "text-white/80"
                      }`}
                    >
                      {milestone.title}
                    </span>
                    {milestone.completed && milestone.completedAt && (
                      <span className="text-xs text-white/40">
                        {new Date(milestone.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveMilestone(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
              {goal.milestones.length === 0 && (
                <p className="text-white/40 text-center py-4">
                  No milestones yet. Add one above!
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
                <span className="text-white/60 text-sm">Category</span>
                <span className="text-white/80 text-sm capitalize">
                  {goal.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Priority</span>
                <span className="text-white/80 text-sm capitalize">
                  {goal.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Status</span>
                <span className="text-white/80 text-sm capitalize">
                  {goal.status.replace("-", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Created</span>
                <span className="text-white/80 text-sm">
                  {new Date(goal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Updated</span>
                <span className="text-white/80 text-sm">
                  {new Date(goal.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {goal.tags && goal.tags.length > 0 && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {goal.tags.map((tag, index) => (
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
