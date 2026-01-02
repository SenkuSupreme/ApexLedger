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
      const res = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
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
    if (streak >= 7) return "text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
    if (streak >= 3) return "text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
    return "text-foreground/80 dark:text-muted-foreground";
  };

  const isCompletedToday = (habit: any) => {
    if (!habit.completions || !Array.isArray(habit.completions)) return false;
    const today = new Date().toDateString();
    return habit.completions.some(
      (c: any) => new Date(c.date).toDateString() === today
    );
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Trading Discipline</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Daily Habits</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-yellow-500/80">
          <Zap size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {habits.length > 0 ? (
          habits.map((habit, index) => {
            const completed = isCompletedToday(habit);
            return (
              <div
                key={habit._id || index}
                className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-border rounded-2xl hover:bg-white/[0.04] hover:border-border transition-all group"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleHabit(habit._id)}
                    className="text-foreground/80 dark:text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {completed ? (
                      <CheckSquare size={22} className="text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    ) : (
                      <Square size={22} className="group-hover:text-foreground dark:text-foreground transition-colors" />
                    )}
                  </button>
                  <div>
                    <div className="text-sm font-black text-foreground dark:text-foreground uppercase tracking-tight">
                      {habit.title}
                    </div>
                    <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-wider font-black">
                      {habit.frequency}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-2xl font-black italic tabular-nums ${getStreakColor(
                      habit.streak
                    )}`}
                  >
                    {habit.streak || 0}
                  </div>
                  <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black">Streak</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="p-6 bg-foreground/[0.02] rounded-3xl border border-border mb-6 inline-block">
              <CheckSquare size={32} className="text-foreground/40 dark:text-muted-foreground/40" />
            </div>
            <p className="text-[10px] text-foreground/60 dark:text-muted-foreground font-black uppercase tracking-wider italic">No habits tracked</p>
          </div>
        )}
      </div>
    </div>
  );
}
