"use client";

import React from "react";
import {
  DollarSign,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart2,
  AlertTriangle,
} from "lucide-react";

interface DashboardSummaryProps {
  stats: any;
  loading: boolean;
}

export default function DashboardSummary({
  stats,
  loading,
}: DashboardSummaryProps) {
  const summaryCards = [
    {
      title: "Total P&L",
      value: `${(stats?.totalPnl || 0) >= 0 ? "+" : ""}$${
        stats?.totalPnl?.toFixed(2) || "0.00"
      }`,
      icon: DollarSign,
      color: (stats?.totalPnl || 0) >= 0 ? "text-green-400" : "text-red-400",
      bgColor:
        (stats?.totalPnl || 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10",
      borderColor:
        (stats?.totalPnl || 0) >= 0
          ? "border-green-500/20"
          : "border-red-500/20",
      subtitle: `${stats?.totalTrades || 0} trades`,
    },
    {
      title: "Win Rate",
      value: `${stats?.winRate?.toFixed(1) || "0.0"}%`,
      icon: Target,
      color:
        (stats?.winRate || 0) >= 60
          ? "text-green-400"
          : (stats?.winRate || 0) >= 50
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        (stats?.winRate || 0) >= 60
          ? "bg-green-500/10"
          : (stats?.winRate || 0) >= 50
          ? "bg-yellow-500/10"
          : "bg-red-500/10",
      borderColor:
        (stats?.winRate || 0) >= 60
          ? "border-green-500/20"
          : (stats?.winRate || 0) >= 50
          ? "border-yellow-500/20"
          : "border-red-500/20",
      subtitle: `${stats?.wins || 0}W / ${stats?.losses || 0}L`,
    },
    {
      title: "Profit Factor",
      value: stats?.profitFactor?.toFixed(2) || "0.00",
      icon: Activity,
      color:
        (stats?.profitFactor || 0) >= 1.5
          ? "text-green-400"
          : (stats?.profitFactor || 0) >= 1.0
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        (stats?.profitFactor || 0) >= 1.5
          ? "bg-green-500/10"
          : (stats?.profitFactor || 0) >= 1.0
          ? "bg-yellow-500/10"
          : "bg-red-500/10",
      borderColor:
        (stats?.profitFactor || 0) >= 1.5
          ? "border-green-500/20"
          : (stats?.profitFactor || 0) >= 1.0
          ? "border-yellow-500/20"
          : "border-red-500/20",
      subtitle: "> 1.5 is healthy",
    },
    {
      title: "Expectancy",
      value: `$${stats?.expectancy?.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: (stats?.expectancy || 0) > 0 ? "text-green-400" : "text-red-400",
      bgColor:
        (stats?.expectancy || 0) > 0 ? "bg-green-500/10" : "bg-red-500/10",
      borderColor:
        (stats?.expectancy || 0) > 0
          ? "border-green-500/20"
          : "border-red-500/20",
      subtitle: "per trade",
    },
    {
      title: "Avg R-Multiple",
      value: `${stats?.averageR?.toFixed(2) || "0.00"}R`,
      icon: BarChart2,
      color:
        (stats?.averageR || 0) >= 2.0
          ? "text-green-400"
          : (stats?.averageR || 0) >= 1.0
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        (stats?.averageR || 0) >= 2.0
          ? "bg-green-500/10"
          : (stats?.averageR || 0) >= 1.0
          ? "bg-yellow-500/10"
          : "bg-red-500/10",
      borderColor:
        (stats?.averageR || 0) >= 2.0
          ? "border-green-500/20"
          : (stats?.averageR || 0) >= 1.0
          ? "border-yellow-500/20"
          : "border-red-500/20",
      subtitle: "target: > 2.0R",
    },
    {
      title: "Max Drawdown",
      value: `$${stats?.maxDrawdown?.toFixed(2) || "0.00"}`,
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      subtitle: "peak to valley",
    },
  ];

  return (
    <div
      className={`transition-opacity duration-300 ${
        loading ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border ${card.borderColor} ${card.bgColor} hover:border-opacity-40 transition-all group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg bg-white/10 ${card.color} group-hover:bg-white/20 transition-all`}
              >
                <card.icon size={20} />
              </div>
            </div>

            <div className={`text-2xl font-bold ${card.color} mb-2`}>
              {card.value}
            </div>

            <div className="text-sm font-medium text-white mb-1">
              {card.title}
            </div>

            <div className="text-xs text-white/60">{card.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
