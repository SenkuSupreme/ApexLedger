"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Brain } from "lucide-react";

interface PsychologyWidgetProps {
  stats: any;
  className?: string;
}

export default function PsychologyWidget({
  stats,
  className = "",
}: PsychologyWidgetProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold mb-1 text-white">Psychology</h3>
          <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
            Emotional State Analysis
          </p>
        </div>
        <Brain size={20} className="text-white/60" />
      </div>

      {stats?.emotionBreakdown &&
      Object.keys(stats.emotionBreakdown).length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.entries(stats.emotionBreakdown).map(
                ([emotion, count]) => ({
                  emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
                  count,
                  percentage: ((count as number) / stats.totalTrades) * 100,
                })
              )}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="emotion"
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: any) => [
                  `${value} trades (${(
                    (value / stats.totalTrades) *
                    100
                  ).toFixed(1)}%)`,
                  "Count",
                ]}
              />
              <Bar
                dataKey="count"
                fill="#fff"
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-white/40 text-sm">
          No emotion data available
        </div>
      )}
    </div>
  );
}
