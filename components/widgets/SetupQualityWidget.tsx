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
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Grade Performance</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Setup Quality</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-yellow-500/80">
          <Award size={20} />
        </div>
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
        <div className="h-48 flex items-center justify-center text-foreground/60 dark:text-muted-foreground text-sm font-black uppercase tracking-wider italic">
          No grade data available
        </div>
      )}
    </div>
  );
}
