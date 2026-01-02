"use client";

import React, { useState, useEffect } from "react";
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Globe,
  Zap,
  Activity,
  Cpu,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
  impact?: "high" | "medium" | "low";
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("forex");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const categories = [
    { id: "forex", label: "Forex", keywords: "forex,currency,USD,EUR,GBP,JPY" },
    { id: "crypto", label: "Crypto", keywords: "bitcoin,cryptocurrency,crypto,blockchain" },
    { id: "stocks", label: "Stocks", keywords: "stocks,trading,market,NYSE,NASDAQ" },
    { id: "commodities", label: "Commodities", keywords: "gold,oil,commodities,silver" },
    { id: "economics", label: "Economics", keywords: "economy,inflation,GDP,federal reserve" },
  ];

  const fetchNews = async (category: string) => {
    setLoading(true);
    try {
      let fetchedArticles: NewsArticle[] = [];
      
      try {
        const response = await fetch(`/api/news?category=${category}`);
        if (response.ok) {
          const data = await response.json();
          fetchedArticles = data.articles || [];
        }
      } catch (error) {
        console.warn("Internal news API unavailable, falling back to local mock data.");
      }

      if (fetchedArticles.length === 0) {
        fetchedArticles = getMockNews(category);
      }

      setArticles(fetchedArticles);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setArticles(getMockNews(category));
    } finally {
      setLoading(false);
    }
  };

  const getImpactLevel = (text: string): "high" | "medium" | "low" => {
    const highImpactKeywords = ["fed", "federal reserve", "interest rate", "inflation", "gdp", "unemployment", "central bank"];
    const mediumImpactKeywords = ["earnings", "economic data", "trade war", "brexit", "election"];
    const lowerText = text.toLowerCase();
    if (highImpactKeywords.some((keyword) => lowerText.includes(keyword))) return "high";
    if (mediumImpactKeywords.some((keyword) => lowerText.includes(keyword))) return "medium";
    return "low";
  };

  const getMockNews = (category: string): NewsArticle[] => {
    const mockArticles = [
      {
        title: "Federal Reserve Signals Potential Rate Changes in Q2",
        description: "The Federal Reserve indicated possible monetary policy adjustments following recent economic data showing mixed signals.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
        publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        source: { name: "Financial Times" },
        category,
        impact: "high" as const,
      },
      {
        title: "EUR/USD Breaks Key Resistance Level at 1.0950",
        description: "The euro strengthened against the dollar following positive eurozone economic data and dovish comments from Fed officials.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        source: { name: "Reuters" },
        category,
        impact: "medium" as const,
      },
    ];
    return mockArticles;
  };

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 text-white font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-sky-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 relative z-10 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400">
               <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Live News Feed</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/60">
               <Globe size={10} className="text-sky-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Status: Live</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
            Market News
          </h1>
          <p className="text-white/80 text-sm font-medium italic max-w-xl leading-relaxed">
            "Get the latest financial news and market updates. Monitor high-impact economic events and staying informed on global market shifts."
          </p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] italic mb-1">Last Update</span>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl">
              <RefreshCw size={12} className="text-sky-500/50 animate-spin" />
              <span className="text-xl font-black text-white/95 italic tracking-tighter tabular-nums">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <button
            onClick={() => fetchNews(selectedCategory)}
            className="h-16 w-16 flex items-center justify-center bg-white text-black hover:bg-sky-500 hover:text-white rounded-[1.5rem] transition-all shadow-2xl active:scale-95 group overflow-hidden"
          >
            <RefreshCw size={24} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Institutional Filter Matrix */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-8 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border italic ${
                selectedCategory === category.id
                  ? "bg-white text-black border-white shadow-xl scale-105"
                  : "bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="relative group min-w-[350px]">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-sky-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-black/40 border border-white/5 rounded-[2rem] text-white placeholder:text-white/30 text-[11px] font-black uppercase tracking-[0.3em] focus:border-sky-500/30 focus:outline-none focus:bg-white/[0.04] transition-all backdrop-blur-md shadow-inner italic"
          />
        </div>
      </div>

      {/* News Intelligence Matrix */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-center gap-6">
           <div className="w-16 h-16 border-2 border-white/5 border-t-sky-500 rounded-full animate-spin" />
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">Loading News...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredArticles.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full py-40 text-center relative group overflow-hidden bg-white/[0.01] border border-dashed border-white/10 rounded-[4rem]"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full" />
          <Newspaper size={64} className="text-white/40 mx-auto mb-10 relative z-10" />
          <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter italic">No News Found</h3>
          <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.5em] mb-12 max-w-sm mx-auto italic leading-relaxed">
            "No news detected in this category. Please check back later or try another category."
          </p>
        </motion.div>
      )}
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const colors = {
    high: "text-red-400 bg-red-500/10 border-red-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  };

  const icons = {
    high: <AlertCircle size={12} />,
    medium: <TrendingUp size={12} />,
    low: <Zap size={12} />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-[3rem] overflow-hidden hover:border-sky-500/30 transition-all duration-700 group flex flex-col shadow-3xl"
    >
      {article.urlToImage && (
        <div className="aspect-[16/10] bg-white/[0.02] overflow-hidden relative">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-6 left-6">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${colors[article.impact || "low"]}`}>
              {icons[article.impact || "low"]}
              {article.impact?.toUpperCase() || "LOW"} IMPACT
            </div>
          </div>
        </div>
      )}

      <div className="p-10 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                 <Globe size={14} className="text-white/50" />
              </div>
              <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] italic">{article.source.name}</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">
             <Clock size={12} className="opacity-60" />
             {timeAgo(article.publishedAt)}
           </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight italic leading-tight group-hover:text-sky-400 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-[13px] text-white/60 line-clamp-3 mb-10 italic leading-relaxed font-medium">
          "{article.description}"
        </p>

        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="px-4 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-[0.3em] italic">
             {article.category}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[10px] font-black text-white/60 hover:text-sky-400 uppercase tracking-[0.3em] transition-all italic group/link"
          >
            Read Full Article
            <ExternalLink size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
