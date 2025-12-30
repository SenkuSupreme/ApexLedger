"use client";

import React from "react";
import { Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface RecentTradesWidgetProps {
  stats: any;
  className?: string;
}

export default function RecentTradesWidget({
  stats,
  className = "",
}: RecentTradesWidgetProps) {
  // Use recent trades from stats instead of making separate API call
  const recentTrades = stats?.recentTrades || [];

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Trades</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Latest Activity
          </p>
        </div>
        <Activity size={20} className="text-white/60" />
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {recentTrades.length > 0
          ? recentTrades.map((trade: any, index: number) => (
              <div
                key={trade._id || index}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      trade.pnl >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {trade.symbol || "Unknown"}
                    </div>
                    <div className="text-xs text-white/60">
                      {trade.direction || "long"} •{" "}
                      {new Date(
                        trade.timestampEntry || trade.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}$
                    {trade.pnl?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-xs text-white/60 font-mono">
                    {trade.rMultiple
                      ? `${trade.rMultiple.toFixed(1)}R`
                      : "0.0R"}
                  </div>
                </div>
              </div>
            ))
          : [1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white/2 border border-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <div className="text-sm text-white/40">No trades yet</div>
                </div>
                <span className="text-xs text-gray-600 font-mono">--</span>
              </div>
            ))}
      </div>
    </div>
  );
}
