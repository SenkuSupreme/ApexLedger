"use client";

import React, { useState, useEffect } from "react";
import { Target, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface GoalsProgressWidgetProps {
  className?: string;
}

export default function GoalsProgressWidget({
  className = "",
}: GoalsProgressWidgetProps) {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    // Fetch goals
    const fetchGoals = async () => {
      try {
        const res = await fetch("/api/goals?limit=3");
        const data = await res.json();
        setGoals(data.goals || []);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    };

    fetchGoals();
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "from-green-500 to-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]";
    if (progress >= 50) return "from-yellow-500 to-orange-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]";
    return "from-red-500 to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={18} className="text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />;
      case "in_progress":
        return <Clock size={18} className="text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
      default:
        return <Target size={18} className="text-foreground/80 dark:text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      case "in_progress":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      default:
        return "bg-foreground/5 border-border text-foreground/80 dark:text-muted-foreground";
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Trading Objectives</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Goals Progress</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-blue-500/80">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal, index) => (
            <div
              key={goal._id || index}
              className="p-5 bg-foreground/[0.02] border border-border rounded-2xl hover:bg-white/[0.04] hover:border-border transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(goal.status)}
                  <span className="text-sm font-black text-foreground dark:text-foreground uppercase tracking-tight truncate">
                    {goal.title}
                  </span>
                </div>
                <span className="text-xl font-black text-foreground dark:text-foreground italic tabular-nums ml-3">
                  {goal.progress || 0}%
                </span>
              </div>

              <div className="w-full bg-foreground/10 rounded-full h-3 mb-4 overflow-hidden border border-border">
                <div
                  className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${getProgressColor(
                    goal.progress || 0
                  )}`}
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(goal.status)}`}>
                  {goal.category}
                </span>
                <span className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-wider font-black">
                  Due: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="p-6 bg-foreground/[0.02] rounded-3xl border border-border mb-6 inline-block">
              <Target size={32} className="text-foreground/40 dark:text-muted-foreground/40" />
            </div>
            <p className="text-[10px] text-foreground/60 dark:text-muted-foreground font-black uppercase tracking-wider italic">No active goals</p>
          </div>
        )}
      </div>
    </div>
  );
}
