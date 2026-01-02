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
  CartesianGrid
} from "recharts";

interface StrategyPerformanceWidgetProps {
  stats: any;
  className?: string;
}

export default function StrategyPerformanceWidget({
  stats,
  className = "",
}: StrategyPerformanceWidgetProps) {
  const data = stats?.strategyBreakdown ? 
    Object.entries(stats.strategyBreakdown).map(([name, val]: [string, any]) => ({
      name: name,
      pnl: val.pnl,
      count: val.count
    })) : [];

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Strategy Edge</h3>
          <p className="text-[10px] text-foreground/60 dark:text-muted-foreground font-mono uppercase tracking-[0.3em] mt-1">
            PnL breakdown by Logic
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                type="number"
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-foreground/40 text-xs italic">
            Executing strategic analysis...
          </div>
        )}
      </div>
    </div>
  );
}
