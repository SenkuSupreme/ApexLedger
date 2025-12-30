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
} from "lucide-react";

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
    {
      id: "crypto",
      label: "Crypto",
      keywords: "bitcoin,cryptocurrency,crypto,blockchain",
    },
    {
      id: "stocks",
      label: "Stocks",
      keywords: "stocks,trading,market,NYSE,NASDAQ",
    },
    {
      id: "commodities",
      label: "Commodities",
      keywords: "gold,oil,commodities,silver",
    },
    {
      id: "economics",
      label: "Economics",
      keywords: "economy,inflation,GDP,federal reserve",
    },
  ];

  // Fetch news from NewsAPI (you'll need to get a free API key)
  const fetchNews = async (category: string) => {
    setLoading(true);
    try {
      const categoryData = categories.find((c) => c.id === category);
      const keywords = categoryData?.keywords || "forex";

      // Try multiple free news sources
      let articles = [];

      // First try NewsAPI if API key is available
      const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

      if (NEWS_API_KEY && NEWS_API_KEY !== "your_api_key_here") {
        try {
          const response = await fetch(
            `https://newsapi.org/v2/everything?q=${keywords}&sortBy=publishedAt&language=en&pageSize=50&apiKey=${NEWS_API_KEY}`
          );

          if (response.ok) {
            const data = await response.json();
            articles = data.articles.map((article: any) => ({
              ...article,
              category: category,
              impact: getImpactLevel(article.title + " " + article.description),
            }));
          }
        } catch (error) {
          console.log("NewsAPI failed, trying alternative sources");
        }
      }

      // If NewsAPI fails or no key, try alternative free sources
      if (articles.length === 0) {
        try {
          // Try RSS feeds or other free sources
          const response = await fetch(`/api/news?category=${category}`);
          if (response.ok) {
            const data = await response.json();
            articles = data.articles || [];
          }
        } catch (error) {
          console.log("Alternative news sources failed");
        }
      }

      // Fallback to mock data if all sources fail
      if (articles.length === 0) {
        articles = getMockNews(category);
      }

      setArticles(articles);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch news:", error);
      // Use mock data as fallback
      setArticles(getMockNews(category));
    } finally {
      setLoading(false);
    }
  };

  // Determine impact level based on keywords
  const getImpactLevel = (text: string): "high" | "medium" | "low" => {
    const highImpactKeywords = [
      "fed",
      "federal reserve",
      "interest rate",
      "inflation",
      "gdp",
      "unemployment",
      "central bank",
    ];
    const mediumImpactKeywords = [
      "earnings",
      "economic data",
      "trade war",
      "brexit",
      "election",
    ];

    const lowerText = text.toLowerCase();

    if (highImpactKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "high";
    } else if (
      mediumImpactKeywords.some((keyword) => lowerText.includes(keyword))
    ) {
      return "medium";
    }
    return "low";
  };

  // Mock news data as fallback
  const getMockNews = (category: string): NewsArticle[] => {
    const mockArticles = [
      {
        title: "Federal Reserve Signals Potential Rate Changes in Q2",
        description:
          "The Federal Reserve indicated possible monetary policy adjustments following recent economic data showing mixed signals in inflation and employment metrics.",
        url: "https://www.reuters.com/markets/us/",
        urlToImage:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
        publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        source: { name: "Financial Times" },
        category,
        impact: "high" as const,
      },
      {
        title: "EUR/USD Breaks Key Resistance Level at 1.0950",
        description:
          "The euro strengthened against the dollar following positive eurozone economic data and dovish comments from Fed officials.",
        url: "https://www.forexlive.com/",
        urlToImage:
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        source: { name: "Reuters" },
        category,
        impact: "medium" as const,
      },
      {
        title: "Gold Reaches New Monthly High Amid Market Uncertainty",
        description:
          "Gold prices surged to new monthly highs as investors seek safe-haven assets amid ongoing geopolitical tensions and economic uncertainty.",
        url: "https://www.marketwatch.com/investing/metal/gold",
        urlToImage:
          "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=200&fit=crop",
        publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        source: { name: "MarketWatch" },
        category,
        impact: "medium" as const,
      },
      {
        title: "Bitcoin Volatility Increases Ahead of ETF Decision",
        description:
          "Bitcoin price action shows increased volatility as the market awaits regulatory decisions on spot Bitcoin ETF applications.",
        url: "https://www.coindesk.com/markets/",
        urlToImage:
          "https://images.unsplash.com/photo-1518544866330-4e4815de2e40?w=400&h=200&fit=crop",
        publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        source: { name: "CoinDesk" },
        category,
        impact: "high" as const,
      },
      {
        title: "Weekly Economic Calendar: Key Events to Watch",
        description:
          "This week's economic calendar includes important data releases including CPI, GDP, and central bank meetings that could impact market sentiment.",
        url: "https://www.investing.com/economic-calendar/",
        urlToImage:
          "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop",
        publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        source: { name: "Economic Times" },
        category,
        impact: "medium" as const,
      },
    ];

    // Filter and customize based on category
    return mockArticles.map((article) => ({
      ...article,
      category,
      title:
        category === "crypto"
          ? article.title.replace("EUR/USD", "BTC/USD")
          : article.title,
      description:
        category === "crypto"
          ? article.description.replace("euro", "bitcoin")
          : article.description,
    }));
  };

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  // Filter articles based on search term
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-400 bg-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <AlertCircle size={12} />;
      case "medium":
        return <TrendingUp size={12} />;
      case "low":
        return <Zap size={12} />;
      default:
        return <Globe size={12} />;
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Market News
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Real-time financial news and market updates
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-white/60">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={() => fetchNews(selectedCategory)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60">Loading latest news...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      )}

      {filteredArticles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Newspaper size={64} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No News Found</h3>
          <p className="text-white/60">
            {searchTerm
              ? "Try adjusting your search terms"
              : "No articles available for this category"}
          </p>
        </div>
      )}
    </div>
  );
}

// News Card Component
function NewsCard({ article }: { article: NewsArticle }) {
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - published.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-400 bg-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <AlertCircle size={12} />;
      case "medium":
        return <TrendingUp size={12} />;
      case "low":
        return <Zap size={12} />;
      default:
        return <Globe size={12} />;
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
      {/* Image */}
      {article.urlToImage && (
        <div className="aspect-video bg-white/5 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">{article.source.name}</span>
            {article.impact && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getImpactColor(
                  article.impact
                )}`}
              >
                {getImpactIcon(article.impact)}
                {article.impact.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Clock size={12} />
            {timeAgo(article.publishedAt)}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-white/70 line-clamp-3 mb-4">
          {article.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/60">
            {article.category && (
              <span className="px-2 py-1 bg-white/10 rounded-full">
                {article.category}
              </span>
            )}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
          >
            Read More
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
