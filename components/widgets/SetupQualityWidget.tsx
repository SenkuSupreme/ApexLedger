"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Award } from "lucide-react";

interface SetupQualityWidgetProps {
  stats: any;
  className?: string;
}

export default function SetupQualityWidget({
  stats,
  className = "",
}: SetupQualityWidgetProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold mb-1 text-white">Setup Quality</h3>
          <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
            Grade Performance
          </p>
        </div>
        <Award size={20} className="text-white/60" />
      </div>

      {stats?.gradeBreakdown && Object.keys(stats.gradeBreakdown).length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={Object.entries(stats.gradeBreakdown)
                .sort(([a], [b]) => {
                  const gradeOrder = {
                    D: 1,
                    C: 2,
                    B: 3,
                    A: 4,
                    "A+": 5,
                  };
                  return (
                    (gradeOrder[a as keyof typeof gradeOrder] || 0) -
                    (gradeOrder[b as keyof typeof gradeOrder] || 0)
                  );
                })
                .map(([grade, data]: [string, any]) => ({
                  grade,
                  avgPnl: data.avgPnl,
                  count: data.count,
                }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="grade"
                stroke="#666"
                tick={{ fill: "#888", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#666"
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
                formatter={(value: any, name: any) => [
                  `${value.toFixed(2)}`,
                  "Avg P&L",
                ]}
                labelFormatter={(label) => `Grade ${label}`}
              />
              <Line
                type="monotone"
                dataKey="avgPnl"
                stroke="#fff"
                strokeWidth={3}
                dot={{ fill: "#fff", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-white/40 text-sm">
          No grade data available
        </div>
      )}
    </div>
  );
}
