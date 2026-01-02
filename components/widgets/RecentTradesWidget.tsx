"use client";

import React from "react";
import { Activity } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Latest Activity</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Recent Trades</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-blue-500/80">
          <Activity size={20} />
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {recentTrades.length > 0
          ? recentTrades.map((trade: any, index: number) => (
              <div
                key={trade._id || index}
                className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-border rounded-2xl hover:bg-white/[0.04] hover:border-border transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      trade.pnl >= 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-black text-foreground dark:text-foreground uppercase tracking-tight">
                      {trade.symbol || "N/A"}
                    </div>
                    <div className="text-[10px] text-foreground/70 dark:text-muted-foreground font-black uppercase tracking-wider">
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
                      trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}$
                    {trade.pnl?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-xs text-foreground/80 dark:text-muted-foreground font-mono font-medium">
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
                className="flex items-center justify-between p-4 bg-foreground/[0.03] border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">No trades recorded</div>
                </div>
                <span className="text-xs text-foreground/50 dark:text-muted-foreground/50 font-mono">--</span>
              </div>
            ))}
      </div>
    </div>
  );
}
