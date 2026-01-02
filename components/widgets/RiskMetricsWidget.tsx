"use client";

import React from "react";
import { Shield, AlertTriangle, TrendingDown } from "lucide-react";

interface RiskMetricsWidgetProps {
  stats: any;
  className?: string;
}

export default function RiskMetricsWidget({
  stats,
  className = "",
}: RiskMetricsWidgetProps) {
  const riskMetrics = [
    {
      label: "Max Drawdown",
      value: `$${stats?.maxDrawdown?.toFixed(2) || "0.00"}`,
      icon: <TrendingDown size={16} />,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Avg Risk/Trade",
      value: `$${stats?.averageRiskAmount?.toFixed(2) || "0.00"}`,
      icon: <AlertTriangle size={16} />,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Max Risk/Trade",
      value: `$${stats?.maxRiskPerTrade?.toFixed(2) || "0.00"}`,
      icon: <Shield size={16} />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Avg Account Risk",
      value: `${stats?.avgAccountRisk?.toFixed(2) || "0.00"}%`,
      icon: <AlertTriangle size={16} />,
      color:
        (stats?.avgAccountRisk || 0) <= 2
          ? "text-green-400"
          : (stats?.avgAccountRisk || 0) <= 5
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        (stats?.avgAccountRisk || 0) <= 2
          ? "bg-green-500/10"
          : (stats?.avgAccountRisk || 0) <= 5
          ? "bg-yellow-500/10"
          : "bg-red-500/10",
    },
  ];

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Risk Management</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Risk Metrics</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-red-500/80">
          <Shield size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {riskMetrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl border border-border ${metric.bgColor} hover:border-border transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-foreground/10 ${metric.color}`}>
                  {metric.icon}
                </div>
                <div>
                  <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black">{metric.label}</div>
                  <div className={`text-2xl font-black italic tabular-nums ${metric.color}`}>
                    {metric.value}
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
