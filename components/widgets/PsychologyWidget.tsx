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
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Emotional State Analysis</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Psychology</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-purple-500/80">
          <Brain size={20} />
        </div>
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
        <div className="h-48 flex items-center justify-center text-foreground/60 dark:text-muted-foreground text-sm font-black uppercase tracking-wider italic">
          No emotion data available
        </div>
      )}
    </div>
  );
}
