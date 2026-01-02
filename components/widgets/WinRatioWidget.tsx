"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface WinRatioWidgetProps {
  stats: any;
  className?: string;
}

const COLORS = ["#fff", "#333"];

export default function WinRatioWidget({
  stats,
  className = "",
}: WinRatioWidgetProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Performance Split</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Win Ratio</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-purple-500/80">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        </div>
      </div>

      <div className="h-[200px] w-full flex items-center justify-center relative">
        {(stats?.wins || 0) + (stats?.losses || 0) > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Wins", value: stats.wins },
                    { name: "Losses", value: stats.losses },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell key={`cell-win`} fill="#fff" />
                  <Cell key={`cell-loss`} fill="#333" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-4xl font-black italic tabular-nums">{stats.winRate}%</span>
              <span className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black">
                Win Rate
              </span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground/80 font-mono text-xs">NO DATA</div>
        )}
      </div>

      {(stats?.wins || 0) + (stats?.losses || 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-foreground/[0.02] rounded-2xl p-4 text-center border border-border hover:border-border transition-all">
            <div className="text-2xl font-black text-foreground dark:text-foreground italic tabular-nums">{stats.wins}</div>
            <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black">
              Wins
            </div>
          </div>
          <div className="bg-foreground/[0.02] rounded-2xl p-4 text-center border border-border hover:border-border transition-all">
            <div className="text-2xl font-black text-foreground dark:text-foreground italic tabular-nums">{stats.losses}</div>
            <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black">
              Losses
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
