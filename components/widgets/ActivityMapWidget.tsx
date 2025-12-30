"use client";

import React from "react";
import CalendarHeatmap from "@/components/CalendarHeatmap";

interface ActivityMapWidgetProps {
  stats: any;
  className?: string;
}

export default function ActivityMapWidget({
  stats,
  className = "",
}: ActivityMapWidgetProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Activity Map
          </h3>
          <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
            Trade Distribution & Performance
          </p>
        </div>
      </div>

      <div className="h-[200px]">
        {stats?.heatmap ? (
          <CalendarHeatmap data={stats.heatmap} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/60 text-sm">
            Initializing activity data...
          </div>
        )}
      </div>
    </div>
  );
}
