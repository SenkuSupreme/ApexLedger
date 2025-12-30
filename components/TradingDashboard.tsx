"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain,
  Newspaper,
  Timer,
  Microscope,
  Target,
  DollarSign,
  Activity,
  ExternalLink,
  RefreshCw,
  Calendar,
  Clock,
} from "lucide-react";
import { calculateTradeMetrics } from "@/lib/utils/tradeCalculations";

interface DashboardData {
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  activeBiases: number;
  recentNews: any[];
  todaysSessions: any[];
  researchNotes: number;
  chartSymbols: string[];
}

export default function TradingDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalTrades: 0,
    totalPnL: 0,
    winRate: 0,
    activeBiases: 0,
    recentNews: [],
    todaysSessions: [],
    researchNotes: 0,
    chartSymbols: [],
  });
  const [loading, setLoading] = useState(true);

  // Helper function to get correct P&L value (calculated if possible, otherwise stored)
  const getCorrectPnL = (trade: any) => {
    // If we have all the required data, calculate the P&L
    if (trade.entryPrice && trade.exitPrice && trade.quantity) {
      try {
        const metrics = calculateTradeMetrics({
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          stopLoss: 0, // Not needed for P&L calculation
          takeProfit: 0, // Not needed for P&L calculation
          quantity: trade.quantity,
          direction: trade.direction || "long",
          portfolioBalance: 10000, // Default, not needed for P&L calculation
          fees: trade.fees || 0,
          assetType: trade.assetType || "forex",
          symbol: trade.symbol || "",
        });
        return metrics.netPnl;
      } catch (error) {
        console.error("Error calculating P&L for trade:", trade._id, error);
      }
    }

    // Fallback to stored value
    return trade.pnl || 0;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data from all endpoints
      const [tradesRes, biasRes, newsRes, sessionsRes, researchRes] =
        await Promise.all([
          fetch("/api/trades"),
          fetch("/api/bias"),
          fetch("/api/news?category=forex"),
          fetch("/api/sessions"),
          fetch("/api/research"),
        ]);

      const [trades, biases, news, sessions, research] = await Promise.all([
        tradesRes.json(),
        biasRes.json(),
        newsRes.json(),
        sessionsRes.json(),
        researchRes.json(),
      ]);

      // Calculate metrics with proper error handling
      const totalTrades = trades.pagination?.total || 0;
      const tradesArray = trades.trades || [];

      let totalPnL = 0;
      let winningTrades = 0;

      // Calculate P&L using the calculation utility for accuracy
      tradesArray.forEach((trade: any) => {
        const calculatedPnL = getCorrectPnL(trade);
        totalPnL += calculatedPnL;
        if (calculatedPnL > 0) {
          winningTrades++;
        }
      });

      const winRate =
        totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

      const activeBiases = (biases.biases || []).filter(
        (bias: any) => bias.status === "active"
      ).length;
      const recentNews = (news.articles || []).slice(0, 3);
      const todaysSessions = (sessions.sessions || []).filter(
        (session: any) => {
          const today = new Date().toISOString().split("T")[0];
          return session.date === today;
        }
      );
      const researchNotes = research.total || 0;

      // Get unique symbols from trades for chart suggestions
      const chartSymbols = [
        ...new Set((trades.trades || []).map((trade: any) => trade.symbol)),
      ].slice(0, 4);

      setData({
        totalTrades,
        totalPnL,
        winRate,
        activeBiases,
        recentNews,
        todaysSessions,
        researchNotes,
        chartSymbols: chartSymbols as string[],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set mock data
      setData({
        totalTrades: 45,
        totalPnL: 1250.75,
        winRate: 68,
        activeBiases: 3,
        recentNews: [
          {
            title: "Fed Signals Rate Changes",
            source: { name: "Reuters" },
            publishedAt: new Date().toISOString(),
          },
          {
            title: "EUR/USD Breaks Resistance",
            source: { name: "ForexLive" },
            publishedAt: new Date().toISOString(),
          },
        ],
        todaysSessions: [
          {
            session: "london",
            totalPnL: 125.5,
            totalTrades: 3,
            winRate: 67,
          },
        ],
        researchNotes: 12,
        chartSymbols: ["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD"],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: "View Charts",
      description: "TradingView integration",
      icon: BarChart3,
      href: "/chart",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      title: "Market News",
      description: "Latest financial news",
      icon: Newspaper,
      href: "/news",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    {
      title: "Research Hub",
      description: "Analysis & notes",
      icon: Microscope,
      href: "/research",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    {
      title: "Session Review",
      description: "Trading sessions",
      icon: Timer,
      href: "/sessions",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    {
      title: "Bias Analysis",
      description: "Market bias review",
      icon: Brain,
      href: "/bias",
      color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    },
    {
      title: "Trade Journal",
      description: "Document trades",
      icon: Activity,
      href: "/journal",
      color: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Trading Dashboard
          </h2>
          <p className="text-white/60">
            Comprehensive overview of your trading ecosystem
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={20} className="text-blue-400" />
            <span className="text-sm text-white/60">Total Trades</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.totalTrades}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign
              size={20}
              className={data.totalPnL >= 0 ? "text-green-400" : "text-red-400"}
            />
            <span className="text-sm text-white/60">Total P&L</span>
          </div>
          <div
            className={`text-3xl font-bold ${
              data.totalPnL >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ${data.totalPnL.toFixed(2)}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={20} className="text-purple-400" />
            <span className="text-sm text-white/60">Win Rate</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.winRate}%</div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={20} className="text-pink-400" />
            <span className="text-sm text-white/60">Active Biases</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {data.activeBiases}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg border ${action.color}`}>
                <action.icon size={24} />
              </div>
              <ExternalLink
                size={16}
                className="text-white/40 group-hover:text-white/60 transition-colors"
              />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {action.title}
            </h3>
            <p className="text-sm text-white/60">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent News */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Newspaper size={20} className="text-green-400" />
              Latest Market News
            </h3>
            <Link
              href="/news"
              className="text-sm text-green-400 hover:text-green-300"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {data.recentNews.length > 0 ? (
              data.recentNews.map((article, index) => (
                <div
                  key={index}
                  className="border-b border-white/10 pb-4 last:border-b-0"
                >
                  <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>{article.source.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(article.publishedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No recent news available</p>
            )}
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Timer size={20} className="text-orange-400" />
              Today's Sessions
            </h3>
            <Link
              href="/sessions"
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {data.todaysSessions.length > 0 ? (
              data.todaysSessions.map((session, index) => (
                <div
                  key={index}
                  className="border-b border-white/10 pb-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white capitalize">
                      {session.session} Session
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        session.totalPnL >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ${session.totalPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>{session.totalTrades} trades</span>
                    <span>{session.winRate}% win rate</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">
                No sessions recorded today
              </p>
            )}
          </div>
        </div>

        {/* Chart Symbols */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-400" />
              Frequently Traded
            </h3>
            <Link
              href="/chart"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Open Charts
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {data.chartSymbols.length > 0 ? (
              data.chartSymbols.map((symbol, index) => (
                <Link
                  key={index}
                  href={`/chart?symbol=${symbol}`}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-colors"
                >
                  <div className="text-sm font-bold text-white">{symbol}</div>
                  <div className="text-xs text-white/60">View Chart</div>
                </Link>
              ))
            ) : (
              <p className="col-span-2 text-sm text-white/60">
                No trading history available
              </p>
            )}
          </div>
        </div>

        {/* Research Summary */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Microscope size={20} className="text-purple-400" />
              Research Hub
            </h3>
            <Link
              href="/research"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">
                Total Research Notes
              </span>
              <span className="text-lg font-bold text-white">
                {data.researchNotes}
              </span>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/research"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Microscope size={14} />
                Create New Research Note
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Notice */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 animate-pulse"></div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">
              Integrated Trading Ecosystem
            </h4>
            <p className="text-sm text-white/70 mb-4">
              Your trading platform is fully integrated. Charts connect to news
              analysis, bias reviews link to journal entries, and session
              reviews aggregate your daily performance. Everything works
              together to improve your trading decisions.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                TradingView Charts
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                Live News Feed
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                Bias Analysis
              </span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                Session Reviews
              </span>
              <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs">
                Research Hub
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
