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
        return "text-white/60 bg-white/5";
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Trading Streaks</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Momentum Tracking
          </p>
        </div>
        <Flame size={20} className="text-white/60" />
      </div>

      <div className="space-y-4">
        {streakData.map((streak, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border border-white/10 ${getStreakColor(
              streak.type
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">{streak.icon}</div>
                <div>
                  <div className="text-sm text-white/60">{streak.label}</div>
                  <div className="text-2xl font-bold text-white">
                    {streak.value}
                    {streak.type !== "neutral" && (
                      <span className="text-sm ml-1">
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
