"use client";

import React from "react";
import { Calendar, AlertCircle, TrendingUp } from "lucide-react";

interface EconomicCalendarWidgetProps {
  className?: string;
}

export default function EconomicCalendarWidget({
  className = "",
}: EconomicCalendarWidgetProps) {
  // Mock economic events - replace with real data
  const events = [
    {
      time: "09:30",
      currency: "USD",
      event: "Non-Farm Payrolls",
      impact: "high",
      forecast: "200K",
      previous: "180K",
    },
    {
      time: "11:00",
      currency: "EUR",
      event: "ECB Interest Rate",
      impact: "high",
      forecast: "4.50%",
      previous: "4.25%",
    },
    {
      time: "14:30",
      currency: "GBP",
      event: "GDP Growth Rate",
      impact: "medium",
      forecast: "0.2%",
      previous: "0.1%",
    },
    {
      time: "16:00",
      currency: "USD",
      event: "Fed Chair Speech",
      impact: "high",
      forecast: "-",
      previous: "-",
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <AlertCircle size={12} className="text-red-400" />;
      case "medium":
        return <TrendingUp size={12} className="text-yellow-400" />;
      default:
        return <Calendar size={12} className="text-green-400" />;
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Economic Calendar</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Today's Events
          </p>
        </div>
        <Calendar size={20} className="text-white/60" />
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {events.map((event, index) => (
          <div
            key={index}
            className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/60">
                  {event.time}
                </span>
                <span className="text-xs font-bold text-white px-2 py-1 bg-white/10 rounded">
                  {event.currency}
                </span>
                {getImpactIcon(event.impact)}
              </div>
              <div
                className={`w-2 h-2 rounded-full ${getImpactColor(
                  event.impact
                )}`}
              />
            </div>

            <div className="text-sm font-medium text-white mb-2">
              {event.event}
            </div>

            <div className="flex justify-between text-xs text-white/60">
              <span>Forecast: {event.forecast}</span>
              <span>Previous: {event.previous}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
