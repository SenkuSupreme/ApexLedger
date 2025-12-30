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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Risk Metrics</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Risk Management
          </p>
        </div>
        <Shield size={20} className="text-white/60" />
      </div>

      <div className="space-y-4">
        {riskMetrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border border-white/10 ${metric.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/10 ${metric.color}`}>
                  {metric.icon}
                </div>
                <div>
                  <div className="text-sm text-white/60">{metric.label}</div>
                  <div className={`text-xl font-bold ${metric.color}`}>
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
