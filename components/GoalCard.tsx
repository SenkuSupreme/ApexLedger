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
  Edit3,
  Trash2,
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
  trading: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  learning: "bg-green-500/10 text-green-400 border-green-500/20",
  financial: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  personal: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

const statusColors = {
  "not-started": "bg-muted text-muted-foreground border-border",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
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
    if (!goal.milestones) return;
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
    <div 
      className="group relative bg-card/40 border border-border rounded-[2.5rem] p-8 h-full flex flex-col transition-all duration-500 hover:bg-card/60 hover:border-primary/20 cursor-pointer overflow-hidden shadow-2xl"
      onClick={() => router.push(`/details?type=goal&id=${goal._id}`)}
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[100px] group-hover:bg-primary/10 transition-all duration-700" />
      
      {/* Modal Grain Effect */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Persistent Action Node - FRONT PROTECTED */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(goal);
          }}
          className="p-2.5 bg-foreground/5 hover:bg-foreground text-muted-foreground hover:text-background rounded-xl border border-border transition-all duration-300"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteDialog(true);
          }}
          className="p-2.5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/10 transition-all duration-300"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Category Node */}
      <div className="mb-6 flex gap-2">
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${categoryColors[goal.category as keyof typeof categoryColors] || categoryColors.other}`}>
           {goal.category || "General"} Node
        </span>
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${statusColors[goal.status as keyof typeof statusColors] || statusColors["not-started"]}`}>
          {goal.status?.replace("-", " ") || "Pending Sync"}
        </span>
      </div>

      {/* Title & Description Mesh */}
      <div className="relative z-10 space-y-4 flex-1 pointer-events-none">
        <h3 className="text-2xl font-black text-foreground leading-tight tracking-tighter uppercase italic pr-20">
          {goal.title}
        </h3>
        
        {goal.description && (
          <p className="text-muted-foreground text-sm leading-relaxed font-medium italic line-clamp-2">
            "{goal.description}"
          </p>
        )}
      </div>

      {/* Progress Mesh */}
      <div className="relative z-10 mt-8 mb-6 pointer-events-none">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Execution Progress</span>
          <span className="text-[11px] font-black text-foreground italic">{goal.progress}%</span>
        </div>
        <div className="w-full bg-foreground/5 rounded-full h-1.5 overflow-hidden border border-border">
          <div
            className="bg-foreground h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--foreground),0.3)]"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Milestones Mesh */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="relative z-10 space-y-2 mb-8" onClick={(e) => e.stopPropagation()}>
          <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] mb-3">Key Milestones</div>
          <div className="space-y-2">
            {goal.milestones.slice(0, 3).map((milestone, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 bg-foreground/[0.02] px-3 py-2.5 rounded-2xl border border-border hover:bg-foreground/[0.04] transition-all cursor-pointer"
                onClick={() => toggleMilestone(index)}
              >
                {milestone.completed ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border" />
                )}
                <span className={`text-[11px] font-black uppercase tracking-tighter truncate italic ${milestone.completed ? "text-muted-foreground/20 line-through" : "text-muted-foreground/60"}`}>
                  {milestone.title}
                </span>
              </div>
            ))}
            {goal.milestones.length > 3 && (
               <div className="text-[9px] font-black text-muted-foreground/10 uppercase tracking-widest pl-2">
                  + {goal.milestones.length - 3} More Signals
               </div>
            )}
          </div>
        </div>
      )}

      {/* Terminal Footer */}
      <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/10 pt-6 border-t border-border relative z-10 w-full pointer-events-none">
        <div className="flex items-center gap-3">
          {goal.targetDate && (
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-blue-500/40" />
              <span>Due {formatDate(goal.targetDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Target size={12} className="text-purple-500/40" />
            <span>{goal.priority} PL</span>
          </div>
        </div>

        {goal.tags && goal.tags.length > 0 && (
          <div className="flex gap-2">
            {goal.tags.slice(0, 1).map((tag, i) => (
              <span
                key={i}
                className="bg-foreground/5 text-muted-foreground/20 px-3 py-1 rounded-lg border border-border"
              >
                #{tag}
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
        title="Institutional Purge"
        message={`Terminate objective signal "${goal.title}"? This protocol is irreversible.`}
      />
    </div>
  );
}
