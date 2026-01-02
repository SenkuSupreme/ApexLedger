"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
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
          <h3 className="text-2xl font-bold text-foreground dark:text-foreground tracking-tight">
            Equity Curve
          </h3>
          <p className="text-[11px] text-foreground/80 dark:text-muted-foreground font-mono uppercase tracking-[0.2em]">
            Aggregate Account Growth
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="text-[10px] font-black text-foreground/80 dark:text-muted-foreground uppercase tracking-[0.2em]">
              Current P&L
            </div>
            <div
              className={`text-2xl font-black ${
                (stats?.totalPnl || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
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
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                padding={{ left: 20, right: 20 }}
                minTickGap={30}
              />
              <YAxis
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
                itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}
                labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: "600", marginBottom: "4px" }}
                cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPnL)"
                animationDuration={1500}
                activeDot={{ r: 4, strokeWidth: 0, fill: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center border border-dashed border-border rounded-2xl bg-white/[0.01]">
            <div className="flex flex-col items-center gap-3 opacity-40">
              <div className="p-3 bg-foreground/5 rounded-full">
                <Activity size={20} className="text-foreground/90 dark:text-foreground" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/80 dark:text-muted-foreground">Waiting for Market Data</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}