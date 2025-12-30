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
      <h3 className="text-xl font-bold mb-1 text-white">Win Ratio</h3>
      <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em] mb-6">
        Performance Split
      </p>

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
              <span className="text-3xl font-bold">{stats.winRate}%</span>
              <span className="text-[10px] text-white/60 uppercase">
                Win Rate
              </span>
            </div>
          </>
        ) : (
          <div className="text-gray-600 font-mono text-xs">NO DATA</div>
        )}
      </div>

      {(stats?.wins || 0) + (stats?.losses || 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 rounded p-3 text-center border border-white/5">
            <div className="text-lg font-bold text-white">{stats.wins}</div>
            <div className="text-[10px] text-white/60 uppercase tracking-wider">
              Wins
            </div>
          </div>
          <div className="bg-white/5 rounded p-3 text-center border border-white/5">
            <div className="text-lg font-bold text-white">{stats.losses}</div>
            <div className="text-[10px] text-white/60 uppercase tracking-wider">
              Losses
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
