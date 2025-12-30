"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Activity } from "lucide-react";

interface EquityCurveWidgetProps {
  stats: any;
  className?: string;
}

export default function EquityCurveWidget({
  stats,
  className = "",
}: EquityCurveWidgetProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Equity Curve
          </h3>
          <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
            Aggregate Account Growth
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
              Current P&L
            </div>
            <div
              className={`text-2xl font-black ${
                (stats?.totalPnl || 0) >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {(stats?.totalPnl || 0) >= 0 ? "+" : ""}$
              {stats?.totalPnl?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full relative z-10">
        {stats?.equityCurve && stats.equityCurve.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.equityCurve}>
              <defs>
                <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#333"
                tick={{ fill: "#888", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                padding={{ left: 20, right: 20 }}
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
                  border: "1px solid #222",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
                cursor={{ stroke: "#444", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#fff"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPnL)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-700 font-mono text-xs border border-dashed border-white/5 rounded-xl bg-white/1">
            <div className="flex flex-col items-center gap-2">
              <Activity size={24} className="opacity-20" />
              WAITING FOR MARKET DATA...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
