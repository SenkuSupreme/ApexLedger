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
    getValue: (stats: any) => `$${(stats?.totalPnl || 0).toFixed(2)}`,
    getSubValue: (stats: any) => {
      const pnl = stats?.totalPnl || 0;
      const trades = stats?.totalTrades || 0;
      return trades > 0 ? `${(pnl / trades).toFixed(2)} avg per trade` : "No trades in period";
    },
    getTrend: (stats: any) => (stats?.totalPnl >= 0 ? "up" : "down"),
  },
  winRate: {
    label: "Win Rate",
    getValue: (stats: any) => `${stats?.winRate || "0.0"}%`,
    getSubValue: (stats: any) => `${stats?.wins || 0}W - ${stats?.losses || 0}L`,
    getTrend: (stats: any) => (parseFloat(stats?.winRate) >= 50 ? "up" : "down"),
  },
  profitFactor: {
    label: "Profit Factor",
    getValue: (stats: any) => (stats?.profitFactor || 0).toFixed(2),
    getSubValue: (stats: any) => (stats?.profitFactor >= 2 ? "High Performance" : stats?.profitFactor >= 1 ? "Profitable" : "Unprofitable"),
    getTrend: (stats: any) =>
      parseFloat(stats?.profitFactor) >= 1.5 ? "up" : stats?.profitFactor >= 1.0 ? "neutral" : "down",
  },
  expectancy: {
    label: "Expectancy",
    getValue: (stats: any) => `$${(stats?.expectancy || 0).toFixed(2)}`,
    getSubValue: () => "Per Trade Edge",
    getTrend: (stats: any) =>
      parseFloat(stats?.expectancy) > 0 ? "up" : "down",
  },
  averageR: {
    label: "Avg R-Multiple",
    getValue: (stats: any) => `${(stats?.averageR || 0).toFixed(2)}R`,
    getSubValue: () => "Reward/Risk Ratio",
    getTrend: (stats: any) =>
      parseFloat(stats?.averageR) >= 2 ? "up" : stats?.averageR >= 1 ? "neutral" : "down",
  },
  maxDrawdown: {
    label: "Max Drawdown",
    getValue: (stats: any) => `$${(stats?.maxDrawdown || 0).toFixed(2)}`,
    getSubValue: (stats: any) => stats?.maxDrawdownPercent ? `${stats.maxDrawdownPercent}% profile impact` : "Minimal Risk",
    getTrend: () => "down",
  },
  totalTrades: {
    label: "Total Trades",
    getValue: (stats: any) => stats?.totalTrades || 0,
    getSubValue: (stats: any) => `${stats?.breakevens || 0} neutral exits`,
    getTrend: () => "neutral",
  },
  accountBalance: {
    label: "Account Balance",
    getValue: (stats: any) => `$${(stats?.currentBalance || stats?.balance || 0).toFixed(2)}`,
    getSubValue: (stats: any) => {
      const pnl = stats?.allTimePnl || 0;
      const initial = stats?.initialBalance || 0;
      const percent = initial > 0 ? (pnl / initial) * 100 : 0;
      return `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} (${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%)`;
    },
    getTrend: (stats: any) => {
      const pnl = stats?.allTimePnl || 0;
      return pnl >= 0 ? "up" : "down";
    },
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
        className={`flex items-center justify-center h-32 text-foreground/60 dark:text-muted-foreground ${className}`}
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
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-foreground/90 dark:text-foreground group-hover:text-foreground group-hover:bg-foreground/10 transition-all">
          <IconComponent size={24} />
        </div>
        {trend === "up" && (
          <ArrowUpRight size={16} className="text-green-500" />
        )}
        {trend === "down" && (
          <ArrowDownRight size={16} className="text-red-500" />
        )}
      </div>

      <div className="text-4xl font-black text-foreground dark:text-foreground tracking-tighter mb-3 italic tabular-nums">
        {value}
      </div>

      <div className="flex justify-between items-end">
        <div className="text-[10px] font-black text-foreground/80 dark:text-muted-foreground uppercase tracking-[0.3em]">
          {config.label}
        </div>
        <div
          className={`text-[10px] font-black uppercase tracking-wider italic ${
            trend === "up"
              ? "text-emerald-500"
              : trend === "down"
              ? "text-rose-500"
              : "text-foreground dark:text-muted-foreground"
          }`}
        >
          {subValue}
        </div>
      </div>
    </div>
  );
}
