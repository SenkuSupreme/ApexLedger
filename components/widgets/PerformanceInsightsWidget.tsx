"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 dark:text-muted-foreground">Key Trading Highlights</span>
          </div>
          <h3 className="text-2xl font-black text-foreground dark:text-foreground italic tracking-tighter uppercase">Performance Insights</h3>
        </div>
        <div className="p-3 bg-foreground/5 rounded-2xl border border-border text-emerald-500/80">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {stats?.bestDay && stats.bestDay.pnl !== -Infinity ? (
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-10 translate-x-10 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  Best Trading Day
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-emerald-200 font-semibold">
                    {new Date(stats.bestDay.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-emerald-400/90 font-medium">
                    {stats.bestDay.count || 1} trade
                    {(stats.bestDay.count || 1) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                    +${stats.bestDay.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-400/70 font-medium uppercase tracking-wider">profit</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-foreground/5 border border-border rounded-2xl">
            <p className="text-sm text-foreground/70 dark:text-muted-foreground text-center font-medium">
              No profitable days recorded yet
            </p>
          </div>
        )}

        {stats?.worstDay && stats.worstDay.pnl !== Infinity ? (
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-rose-500/20 to-rose-600/10 border border-rose-500/30 rounded-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full -translate-y-10 translate-x-10 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <p className="text-xs text-rose-300 font-bold uppercase tracking-wider">
                  Worst Trading Day
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-rose-200 font-semibold">
                    {new Date(stats.worstDay.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-rose-400/90 font-medium">
                    {stats.worstDay.count || 1} trade
                    {(stats.worstDay.count || 1) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rose-400 tabular-nums">
                    ${stats.worstDay.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-rose-400/70 font-medium uppercase tracking-wider">loss</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-foreground/5 border border-border rounded-2xl">
            <p className="text-sm text-foreground/70 dark:text-muted-foreground text-center font-medium">
              No losing days recorded yet
            </p>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-4 bg-foreground/5 rounded-2xl border border-border hover:border-border transition-colors">
            <div className="text-xl font-bold text-white tabular-nums">
              {stats?.profitFactor?.toFixed(2) || "0.00"}
            </div>
            <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black mt-1">Profit Factor</div>
          </div>
          <div className="p-4 bg-foreground/5 rounded-2xl border border-border hover:border-border transition-colors">
            <div className="text-xl font-bold text-white tabular-nums">
              {stats?.averageR?.toFixed(2) || "0.00"}R
            </div>
            <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black mt-1">Avg Reward</div>
          </div>
          <div className="p-4 bg-foreground/5 rounded-2xl border border-border hover:border-border transition-colors">
            <div className="text-xl font-bold text-white tabular-nums">
              {stats?.averageWin > 0
                ? `$${stats.averageWin.toFixed(0)}`
                : "$0"}
            </div>
            <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black mt-1">Avg Win</div>
          </div>
          <div className="p-4 bg-foreground/5 rounded-2xl border border-border hover:border-border transition-colors">
            <div className="text-xl font-bold text-white tabular-nums">
              {stats?.averageLoss > 0
                ? `$${stats.averageLoss.toFixed(0)}`
                : "$0"}
            </div>
            <div className="text-[10px] text-foreground/60 dark:text-muted-foreground uppercase tracking-[0.3em] font-black mt-1">Avg Loss</div>
          </div>
        </div>

        {stats?.expectancy !== undefined && (
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Expectancy</p>
              <p className="text-xs text-foreground/90 dark:text-foreground font-medium">Value per trade</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${stats.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.expectancy >= 0 ? '+' : ''}${stats.expectancy.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
