"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  Target,
  TrendingUp,
  MoreHorizontal,
  CheckCircle,
  Circle,
  Eye,
} from "lucide-react";
import { IGoal } from "@/lib/models/Goal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface GoalCardProps {
  goal: IGoal;
  onUpdate: (goalId: string, updates: Partial<IGoal>) => void;
  onDelete: (goalId: string) => void;
  onEdit: (goal: IGoal) => void;
}

const categoryColors = {
  trading: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  learning: "bg-green-500/20 text-green-400 border-green-500/30",
  financial: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  personal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusColors = {
  "not-started": "bg-gray-500/20 text-gray-400 border-gray-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function GoalCard({
  goal,
  onUpdate,
  onDelete,
  onEdit,
}: GoalCardProps) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const toggleMilestone = (milestoneIndex: number) => {
    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      completed: !updatedMilestones[milestoneIndex].completed,
      completedAt: !updatedMilestones[milestoneIndex].completed
        ? new Date()
        : undefined,
    };

    // Calculate new progress
    const completedMilestones = updatedMilestones.filter(
      (m) => m.completed
    ).length;
    const newProgress = Math.round(
      (completedMilestones / updatedMilestones.length) * 100
    );

    onUpdate(goal._id!, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newProgress === 100 ? "completed" : "in-progress",
    });
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-white tracking-tight">
              {goal.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-lg text-xs border ${
                categoryColors[goal.category]
              }`}
            >
              {goal.category}
            </span>
          </div>
          <div className="mb-3">
            <span
              className={`px-2 py-1 rounded-lg text-xs border ${
                statusColors[goal.status]
              }`}
            >
              {goal.status.replace("-", " ")}
            </span>
          </div>
          {goal.description && (
            <p className="text-sm text-white/60 mb-3">{goal.description}</p>
          )}
        </div>

        <div className="relative group">
          <button className="text-white/40 hover:text-white/60 transition-colors">
            <MoreHorizontal size={16} />
          </button>
          <div className="absolute right-0 top-6 bg-[#0A0A0A] border border-white/20 rounded-lg shadow-xl p-2 hidden group-hover:block z-10 min-w-32">
            <button
              onClick={() => router.push(`/details?type=goal&id=${goal._id}`)}
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white/80 hover:text-white transition-colors flex items-center gap-2"
            >
              <Eye size={14} />
              View Details
            </button>
            <button
              onClick={() => onEdit(goal)}
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white/80 hover:text-white transition-colors"
            >
              Edit
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

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/80">Progress</span>
          <span className="text-sm text-white/60">{goal.progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white/80 mb-2">Milestones</h4>
          <div className="space-y-2">
            {goal.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => toggleMilestone(index)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {milestone.completed ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <Circle size={16} className="text-white/40" />
                  )}
                </button>
                <span
                  className={`text-sm ${
                    milestone.completed
                      ? "line-through text-white/40"
                      : "text-white/80"
                  }`}
                >
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-3">
          {goal.targetDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Due {formatDate(goal.targetDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Target size={12} />
            <span>{goal.priority} priority</span>
          </div>
        </div>

        {goal.tags && goal.tags.length > 0 && (
          <div className="flex gap-1">
            {goal.tags.slice(0, 2).map((tag, i) => (
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
        onConfirm={() => onDelete(goal._id!)}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goal.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
