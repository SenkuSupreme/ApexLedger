"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface MonthlyPerformanceWidgetProps {
  stats: any;
  className?: string;
}

export default function MonthlyPerformanceWidget({
  stats,
  className = "",
}: MonthlyPerformanceWidgetProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Monthly Performance
          </h3>
          <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
            P&L by Month
          </p>
        </div>
      </div>

      {stats?.monthlyData && stats.monthlyData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="month"
                stroke="#333"
                tick={{ fill: "#888", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#333"
                tick={{ fill: "#888", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any) => [`${value.toFixed(2)}`, "P&L"]}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {stats.monthlyData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-white/40 text-sm">
          Insufficient data for monthly analysis
        </div>
      )}
    </div>
  );
}
