"use client";

import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Crosshair,
} from "lucide-react";

interface MetricWidgetProps {
  widget: any;
  stats: any;
  className?: string;
}

const ICON_MAP = {
  DollarSign: DollarSign,
  Target: Target,
  Activity: Activity,
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  BarChart2: BarChart2,
  Crosshair: Crosshair,
};

const METRIC_CONFIG = {
  totalPnl: {
    label: "Total P&L",
    getValue: (stats: any) => `$${stats?.totalPnl?.toFixed(2) || "0.00"}`,
    getSubValue: (stats: any) =>
      stats?.totalPnl >= 0 ? "+12.5% this month" : "-2.3% this month",
    getTrend: (stats: any) => (stats?.totalPnl >= 0 ? "up" : "down"),
  },
  winRate: {
    label: "Win Rate",
    getValue: (stats: any) => `${stats?.winRate || "0.0"}%`,
    getSubValue: () => "Target: 60%",
    getTrend: (stats: any) => (parseFloat(stats?.winRate) > 50 ? "up" : "down"),
  },
  profitFactor: {
    label: "Profit Factor",
    getValue: (stats: any) => stats?.profitFactor || "0.00",
    getSubValue: () => "> 1.5 is healthy",
    getTrend: (stats: any) =>
      parseFloat(stats?.profitFactor) > 1.5 ? "up" : "neutral",
  },
  expectancy: {
    label: "Expectancy",
    getValue: (stats: any) => `${stats?.expectancy || "0.00"}`,
    getSubValue: () => "Per Trade",
    getTrend: (stats: any) =>
      parseFloat(stats?.expectancy) > 0 ? "up" : "down",
  },
  averageR: {
    label: "Avg R-Multiple",
    getValue: (stats: any) => `${stats?.averageR || "0.00"}R`,
    getSubValue: () => "Target: > 2.0R",
    getTrend: (stats: any) =>
      parseFloat(stats?.averageR) > 2 ? "up" : "neutral",
  },
  maxDrawdown: {
    label: "Max Drawdown",
    getValue: (stats: any) => `-${stats?.maxDrawdown || "0.00"}`,
    getSubValue: () => "Peak to Valley",
    getTrend: () => "down",
  },
  totalTrades: {
    label: "Total Trades",
    getValue: (stats: any) => stats?.totalTrades || 0,
    getSubValue: () => "Cumulative",
    getTrend: () => "neutral",
  },
};

export default function MetricWidget({
  widget,
  stats,
  className = "",
}: MetricWidgetProps) {
  const metricKey = widget.config?.metric || "totalPnl";
  const iconKey = widget.config?.icon || "DollarSign";

  const config = METRIC_CONFIG[metricKey as keyof typeof METRIC_CONFIG];
  const IconComponent =
    ICON_MAP[iconKey as keyof typeof ICON_MAP] || DollarSign;

  if (!config) {
    return (
      <div
        className={`flex items-center justify-center h-32 text-white/40 ${className}`}
      >
        Invalid metric configuration
      </div>
    );
  }

  const value = config.getValue(stats);
  const subValue = config.getSubValue(stats);
  const trend = config.getTrend(stats);

  return (
    <div className={`h-full ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/5 rounded-xl text-white/70 group-hover:text-white group-hover:bg-white/10 transition-all">
          <IconComponent size={24} />
        </div>
        {trend === "up" && (
          <ArrowUpRight size={16} className="text-green-500" />
        )}
        {trend === "down" && (
          <ArrowDownRight size={16} className="text-red-500" />
        )}
      </div>

      <div className="text-3xl font-bold text-white tracking-tight mb-2">
        {value}
      </div>

      <div className="flex justify-between items-end">
        <div className="text-xs font-black text-white/50 uppercase tracking-[0.15em]">
          {config.label}
        </div>
        <div
          className={`text-xs font-bold ${
            trend === "up"
              ? "text-emerald-500"
              : trend === "down"
              ? "text-rose-500"
              : "text-white/60"
          }`}
        >
          {subValue}
        </div>
      </div>
    </div>
  );
}
