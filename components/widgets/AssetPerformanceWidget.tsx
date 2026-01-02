"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

interface AssetPerformanceWidgetProps {
  stats: any;
  className?: string;
}

export default function AssetPerformanceWidget({
  stats,
  className = "",
}: AssetPerformanceWidgetProps) {
  const data = stats?.assetTypeBreakdown ? 
    Object.entries(stats.assetTypeBreakdown).map(([name, val]: [string, any]) => ({
      name: name.toUpperCase(),
      value: val.count,
      pnl: val.pnl
    })) : [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Asset Distribution</h3>
          <p className="text-[10px] text-foreground/60 dark:text-muted-foreground font-mono uppercase tracking-[0.3em] mt-1">
            Trade Volume by Asset Class
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-foreground/40 text-xs italic">
            Insufficient market exposure
          </div>
        )}
      </div>
    </div>
  );
}
