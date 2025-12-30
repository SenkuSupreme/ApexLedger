"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

interface PerformanceInsightsWidgetProps {
  stats: any;
  className?: string;
}

export default function PerformanceInsightsWidget({
  stats,
  className = "",
}: PerformanceInsightsWidgetProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Performance Insights</h3>
          <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
            Key Trading Highlights
          </p>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">
          <TrendingUp size={20} className="text-white/60" />
        </div>
      </div>

      <div className="space-y-4">
        {stats?.bestDay && stats.bestDay.pnl !== -Infinity ? (
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-green-400 font-mono uppercase tracking-wider">
                  Best Trading Day
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-green-300 font-medium">
                    {new Date(stats.bestDay.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-green-400/80">
                    {stats.bestDay.count || 1} trade
                    {(stats.bestDay.count || 1) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">
                    +${stats.bestDay.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-400/60">profit</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-sm text-white/40 text-center">
              No profitable days yet
            </p>
          </div>
        )}

        {stats?.worstDay && stats.worstDay.pnl !== Infinity ? (
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <p className="text-xs text-red-400 font-mono uppercase tracking-wider">
                  Challenging Day
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-red-300 font-medium">
                    {new Date(stats.worstDay.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-red-400/80">
                    {stats.worstDay.count || 1} trade
                    {(stats.worstDay.count || 1) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-400">
                    ${stats.worstDay.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-red-400/60">loss</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-sm text-white/40 text-center">
              No losing days recorded
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-lg font-bold text-white">
              {stats?.averageWin > 0
                ? `$${stats.averageWin.toFixed(2)}`
                : "$0.00"}
            </div>
            <div className="text-xs text-white/60">Avg Win</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-lg font-bold text-white">
              {stats?.averageLoss < 0
                ? `$${Math.abs(stats.averageLoss).toFixed(2)}`
                : "$0.00"}
            </div>
            <div className="text-xs text-white/60">Avg Loss</div>
          </div>
        </div>
      </div>
    </div>
  );
}
