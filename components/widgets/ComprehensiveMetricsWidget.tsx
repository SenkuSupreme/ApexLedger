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
  Crosshair,
} from "lucide-react";

interface ComprehensiveMetricsWidgetProps {
  stats: any;
  className?: string;
}

export default function ComprehensiveMetricsWidget({
  stats,
  className = "",
}: ComprehensiveMetricsWidgetProps) {
  const metrics = [
    {
      label: "Total P&L",
      value: `${(stats?.totalPnl || 0) >= 0 ? "+" : ""}$${
        stats?.totalPnl?.toFixed(2) || "0.00"
      }`,
      icon: DollarSign,
      color: (stats?.totalPnl || 0) >= 0 ? "text-green-400" : "text-red-400",
      bgColor:
        (stats?.totalPnl || 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10",
    },
    {
      label: "Win Rate",
      value: `${stats?.winRate || 0}%`,
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
    },
    {
      label: "Profit Factor",
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
    },
    {
      label: "Expectancy",
      value: `$${stats?.expectancy?.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: (stats?.expectancy || 0) > 0 ? "text-green-400" : "text-red-400",
      bgColor:
        (stats?.expectancy || 0) > 0 ? "bg-green-500/10" : "bg-red-500/10",
    },
    {
      label: "Avg R-Multiple",
      value: `${stats?.averageR?.toFixed(2) || "0.00"}R`,
      icon: Crosshair,
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
    },
    {
      label: "Max Drawdown",
      value: `-$${stats?.maxDrawdown?.toFixed(2) || "0.00"}`,
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Total Trades",
      value: stats?.totalTrades || 0,
      icon: BarChart2,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Avg Risk/Trade",
      value: `$${stats?.averageRiskAmount?.toFixed(2) || "0.00"}`,
      icon: AlertTriangle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className={`h-full ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Performance Metrics</h3>
        <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
          Calculated from Trade Journal
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border border-white/10 ${metric.bgColor} hover:border-white/20 transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-white/10 ${metric.color}`}>
                <metric.icon size={16} />
              </div>
            </div>

            <div className={`text-xl font-bold ${metric.color} mb-1`}>
              {metric.value}
            </div>

            <div className="text-xs text-white/60 font-medium">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">
              {stats?.wins || 0}
            </div>
            <div className="text-xs text-white/60">Wins</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">
              {stats?.losses || 0}
            </div>
            <div className="text-xs text-white/60">Losses</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">
              {stats?.breakevens || 0}
            </div>
            <div className="text-xs text-white/60">Breakevens</div>
          </div>
        </div>
      </div>
    </div>
  );
}
