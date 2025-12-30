"use client";

import React, { useState, useEffect } from "react";
import { Target, CheckCircle, Clock } from "lucide-react";

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
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-400" />;
      case "in_progress":
        return <Clock size={16} className="text-yellow-400" />;
      default:
        return <Target size={16} className="text-white/60" />;
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Goals Progress</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Trading Objectives
          </p>
        </div>
        <Target size={20} className="text-white/60" />
      </div>

      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal, index) => (
            <div
              key={goal._id || index}
              className="p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(goal.status)}
                  <span className="text-sm font-medium text-white truncate">
                    {goal.title}
                  </span>
                </div>
                <span className="text-xs text-white/60">
                  {goal.progress || 0}%
                </span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                    goal.progress || 0
                  )}`}
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-white/60">
                <span>{goal.category}</span>
                <span>
                  Due: {new Date(goal.targetDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Target size={32} className="text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">No active goals</p>
          </div>
        )}
      </div>
    </div>
  );
}
