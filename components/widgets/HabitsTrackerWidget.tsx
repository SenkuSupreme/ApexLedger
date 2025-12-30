"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Zap } from "lucide-react";

interface HabitsTrackerWidgetProps {
  className?: string;
}

export default function HabitsTrackerWidget({
  className = "",
}: HabitsTrackerWidgetProps) {
  const [habits, setHabits] = useState<any[]>([]);

  useEffect(() => {
    // Fetch habits
    const fetchHabits = async () => {
      try {
        const res = await fetch("/api/habits?limit=4");
        const data = await res.json();
        setHabits(data.habits || []);
      } catch (error) {
        console.error("Failed to fetch habits:", error);
      }
    };

    fetchHabits();
  }, []);

  const toggleHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
      });
      if (res.ok) {
        // Refresh habits
        const updatedRes = await fetch("/api/habits?limit=4");
        const data = await updatedRes.json();
        setHabits(data.habits || []);
      }
    } catch (error) {
      console.error("Failed to toggle habit:", error);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-green-400";
    if (streak >= 3) return "text-yellow-400";
    return "text-white/60";
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Daily Habits</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Trading Discipline
          </p>
        </div>
        <Zap size={20} className="text-white/60" />
      </div>

      <div className="space-y-3">
        {habits.length > 0 ? (
          habits.map((habit, index) => (
            <div
              key={habit._id || index}
              className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabit(habit._id)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {habit.completedToday ? (
                    <CheckSquare size={20} className="text-green-400" />
                  ) : (
                    <Square size={20} />
                  )}
                </button>
                <div>
                  <div className="text-sm font-medium text-white">
                    {habit.name}
                  </div>
                  <div className="text-xs text-white/60">{habit.frequency}</div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-sm font-bold ${getStreakColor(
                    habit.currentStreak
                  )}`}
                >
                  {habit.currentStreak || 0}
                </div>
                <div className="text-xs text-white/60">streak</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <CheckSquare size={32} className="text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">No habits tracked</p>
          </div>
        )}
      </div>
    </div>
  );
}
