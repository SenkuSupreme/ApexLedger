"use client";

import React, { useState, useEffect } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

interface NewsWidgetProps {
  className?: string;
}

export default function NewsWidget({ className = "" }: NewsWidgetProps) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news?category=forex");
      const data = await res.json();
      if (data.articles) {
        setNews(data.articles.slice(0, 10)); // Top 10
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Market Intelligence</h3>
          <p className="text-xs text-foreground/80 dark:text-muted-foreground font-mono uppercase tracking-widest">
            Live Feed
          </p>
        </div>
        <button 
          onClick={fetchNews}
          className="p-2 hover:bg-foreground/10 rounded-lg transition-colors text-foreground/60"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-foreground/5 rounded-lg animate-pulse" />
          ))
        ) : news.length > 0 ? (
          news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-3 bg-foreground/5 border border-border border-l-4 ${getImpactColor(
                item.impact
              )} rounded-lg hover:bg-foreground/10 transition-colors group`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <ExternalLink
                  size={12}
                  className="text-foreground/60 dark:text-muted-foreground group-hover:text-foreground/80 transition-colors flex-shrink-0 ml-2"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-foreground/60 dark:text-muted-foreground font-bold uppercase tracking-wider">
                <span>{item.source?.name}</span>
                <span>{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </a>
          ))
        ) : (
          <div className="text-center py-8 text-foreground/40 text-xs italic">
            Transmission interrupted...
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <Link
          href="/news"
          className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 dark:text-muted-foreground hover:text-white transition-colors"
        >
          <Newspaper size={12} />
          Terminal Intelligence Hub
        </Link>
      </div>
    </div>
  );
}
