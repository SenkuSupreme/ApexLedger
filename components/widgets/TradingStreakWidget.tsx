"use client";

import React from "react";
import { Flame, Target, TrendingUp } from "lucide-react";

interface TradingStreakWidgetProps {
  stats: any;
  className?: string;
}

export default function TradingStreakWidget({
  stats,
  className = "",
}: TradingStreakWidgetProps) {
  const streakData = [
    {
      label: "Current Streak",
      value: stats?.consistency?.currentStreak || 0,
      type: stats?.consistency?.currentStreakType || "neutral",
      icon: <Flame size={16} />,
    },
    {
      label: "Best Win Streak",
      value: stats?.consistency?.bestWinStreak || 0,
      type: "win",
      icon: <TrendingUp size={16} />,
    },
    {
      label: "Worst Loss Streak",
      value: stats?.consistency?.worstLossStreak || 0,
      type: "loss",
      icon: <Target size={16} />,
    },
  ];

  const getStreakColor = (type: string) => {
    switch (type) {
      case "win":
        return "text-green-400 bg-green-500/10";
      case "loss":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-foreground/80 dark:text-muted-foreground bg-foreground/5";
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Momentum Tracking</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Trading Streaks</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-orange-500/80">
          <Flame size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {streakData.map((streak, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl border border-border ${getStreakColor(
              streak.type
            )} hover:border-border transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-foreground/10">{streak.icon}</div>
                <div>
                  <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black">{streak.label}</div>
                  <div className="text-2xl font-black text-foreground dark:text-foreground italic tabular-nums">
                    {streak.value}
                    {streak.type !== "neutral" && (
                      <span className="text-sm ml-1 font-black uppercase tracking-wider">
                        {streak.type === "win" ? "wins" : "losses"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
