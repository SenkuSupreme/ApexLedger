"use client";

import React from "react";
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsWidgetProps {
  className?: string;
}

export default function NewsWidget({ className = "" }: NewsWidgetProps) {
  // Mock news data - replace with real news feed
  const news = [
    {
      title: "Fed Signals Potential Rate Cut in Q2",
      source: "Reuters",
      time: "2h ago",
      impact: "high",
      url: "#",
    },
    {
      title: "EUR/USD Breaks Key Resistance Level",
      source: "ForexLive",
      time: "4h ago",
      impact: "medium",
      url: "#",
    },
    {
      title: "Bank of England Maintains Hawkish Stance",
      source: "Bloomberg",
      time: "6h ago",
      impact: "high",
      url: "#",
    },
    {
      title: "Gold Reaches New Monthly High",
      source: "MarketWatch",
      time: "8h ago",
      impact: "low",
      url: "#",
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Market News</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Latest Updates
          </p>
        </div>
        <Newspaper size={20} className="text-white/60" />
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {news.map((item, index) => (
          <div
            key={index}
            className={`p-3 bg-white/5 border border-white/10 border-l-4 ${getImpactColor(
              item.impact
            )} rounded-lg hover:bg-white/10 transition-colors cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                {item.title}
              </h4>
              <ExternalLink
                size={12}
                className="text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0 ml-2"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-white/60">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <a
          href="#"
          className="flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          <Newspaper size={12} />
          View All News
        </a>
      </div>
    </div>
  );
}
