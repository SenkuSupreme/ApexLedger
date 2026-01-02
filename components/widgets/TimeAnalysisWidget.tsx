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
import { Clock } from "lucide-react";

interface TimeAnalysisWidgetProps {
  stats: any;
  className?: string;
}

export default function TimeAnalysisWidget({
  stats,
  className = "",
}: TimeAnalysisWidgetProps) {
  // Extract time analysis from all trades, not just recent ones
  const timeData = React.useMemo(() => {
    // Use all trades if available, fallback to recentTrades
    const trades = stats?.allTrades || stats?.recentTrades || [];

    if (trades.length === 0) {
      return [];
    }

    const hourMap = new Map();

    trades.forEach((trade: any) => {
      const timestamp = trade.timestampEntry || trade.createdAt;
      if (!timestamp) return;

      const date = new Date(timestamp);
      const hour = date.getHours();
      const hourLabel =
        hour === 0
          ? "12AM"
          : hour < 12
          ? `${hour}AM`
          : hour === 12
          ? "12PM"
          : `${hour - 12}PM`;

      if (!hourMap.has(hourLabel)) {
        hourMap.set(hourLabel, {
          hour: hourLabel,
          hourValue: hour,
          pnl: 0,
          trades: 0,
          wins: 0,
          losses: 0,
        });
      }

      const hourStats = hourMap.get(hourLabel);
      const pnl = trade.pnl || 0;
      hourStats.pnl += pnl;
      hourStats.trades += 1;

      if (pnl > 0) {
        hourStats.wins += 1;
      } else if (pnl < 0) {
        hourStats.losses += 1;
      }
    });

    return Array.from(hourMap.values()).sort(
      (a, b) => a.hourValue - b.hourValue
    );
  }, [stats?.allTrades, stats?.recentTrades]);

  const bestHour = timeData.reduce(
    (best, current) => (current.pnl > best.pnl ? current : best),
    { hour: "N/A", pnl: -Infinity }
  );

  const worstHour = timeData.reduce(
    (worst, current) => (current.pnl < worst.pnl ? current : worst),
    { hour: "N/A", pnl: Infinity }
  );

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Time Analysis</h3>
          <p className="text-xs text-foreground/80 dark:text-muted-foreground font-mono uppercase tracking-widest">
            Performance by Hour
          </p>
        </div>
        <Clock size={20} className="text-foreground/80 dark:text-muted-foreground" />
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="hour"
              stroke="#666"
              tick={{ fill: "#888", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#666"
              tick={{ fill: "#888", fontSize: 10 }}
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
                name === "pnl" ? `$${value}` : `${value} trades`,
                name === "pnl" ? "P&L" : "Trades",
              ]}
            />
            <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
              {timeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="p-3 bg-foreground/5 rounded-lg text-center">
          <div className="text-lg font-bold text-green-400">
            {bestHour.hour !== "N/A" ? bestHour.hour : "--"}
          </div>
          <div className="text-xs text-foreground/80 dark:text-muted-foreground">Best Hour</div>
          <div className="text-xs text-green-400/60">
            {bestHour.pnl > -Infinity ? `$${bestHour.pnl.toFixed(2)}` : "--"}
          </div>
        </div>
        <div className="p-3 bg-foreground/5 rounded-lg text-center">
          <div className="text-lg font-bold text-red-400">
            {worstHour.hour !== "N/A" ? worstHour.hour : "--"}
          </div>
          <div className="text-xs text-foreground/80 dark:text-muted-foreground">Worst Hour</div>
          <div className="text-xs text-red-400/60">
            {worstHour.pnl < Infinity ? `$${worstHour.pnl.toFixed(2)}` : "--"}
          </div>
        </div>
        <div className="p-3 bg-foreground/5 rounded-lg text-center">
          <div className="text-lg font-bold text-white">
            {timeData.length > 0
              ? timeData.reduce((sum, h) => sum + h.trades, 0)
              : 0}
          </div>
          <div className="text-xs text-foreground/80 dark:text-muted-foreground">Total Trades</div>
          <div className="text-xs text-foreground/60 dark:text-muted-foreground">
            {timeData.length} hours active
          </div>
        </div>
      </div>
    </div>
  );
}
