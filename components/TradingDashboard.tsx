"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Newspaper,
  Timer,
  Microscope,
  Target,
  DollarSign,
  Activity,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { calculateTradeMetrics } from "@/lib/utils/tradeCalculations";

// Import Widgets
import QuickNotesWidget from "./widgets/QuickNotesWidget";
import PerformanceInsightsWidget from "./widgets/PerformanceInsightsWidget";
import ActivityMapWidget from "./widgets/ActivityMapWidget";
import GoalsProgressWidget from "./widgets/GoalsProgressWidget";
import HabitsTrackerWidget from "./widgets/HabitsTrackerWidget";
import PsychologyWidget from "./widgets/PsychologyWidget";

interface DashboardData {
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  activeBiases: number;
  recentNews: any[];
  todaysSessions: any[];
  researchNotes: number;
  chartSymbols: string[];
  performanceStats: {
    averageWin: number;
    averageLoss: number;
    bestDay: { date: string; pnl: number; count: number } | null;
    worstDay: { date: string; pnl: number; count: number } | null;
    profitFactor: number;
    expectancy: number;
    averageR: number;
    maxDrawdown: number;
    wins: number;
    losses: number;
    breakevens: number;
  };
  activityStats: {
    heatmap: any[];
    distribution: any[];
    summary: {
      mostActive: string;
      totalPnL: number;
    };
  };
  psychologyStats: {
    emotionBreakdown: Record<string, number>;
    totalTrades: number;
  };
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
    performanceStats: {
      averageWin: 0,
      averageLoss: 0,
      bestDay: null,
      worstDay: null,
      profitFactor: 0,
      expectancy: 0,
      averageR: 0,
      maxDrawdown: 0,
      wins: 0,
      losses: 0,
      breakevens: 0,
    },
    activityStats: {
      heatmap: [],
      distribution: [],
      summary: {
        mostActive: "",
        totalPnL: 0,
      },
    },
    psychologyStats: {
      emotionBreakdown: {},
      totalTrades: 0,
    },
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
          stopLoss: trade.stopLoss || 0,
          takeProfit: trade.takeProfit || 0,
          quantity: trade.quantity,
          direction: trade.direction || "long",
          portfolioBalance: trade.portfolioBalance || 10000,
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
      let totalWinAmount = 0;
      let totalLossAmount = 0;
      let winCount = 0;
      let lossCount = 0;
      let breakevens = 0;
      let totalR = 0;
      let maxDrawdown = 0;
      let runningPnL = 0;
      let peakPnL = 0;
      const emotionCounts: Record<string, number> = {};

      const symbolMap = new Map<string, { count: number; pnl: number }>();
      const dateMap = new Map<string, { pnl: number; count: number }>();

      // Calculate Metrics
      tradesArray.forEach((trade: any) => {
        const pnl = getCorrectPnL(trade);
        totalPnL += pnl;

        // Peak & Drawdown
        runningPnL += pnl;
        if (runningPnL > peakPnL) peakPnL = runningPnL;
        const drawdown = peakPnL - runningPnL;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;

        // Win/Loss Categorization
        if (pnl > 0.01) {
          winningTrades++;
          totalWinAmount += pnl;
          winCount++;
        } else if (pnl < -0.01) {
          totalLossAmount += Math.abs(pnl);
          lossCount++;
        } else {
          breakevens++;
        }

        // R-Multiple
        if (trade.rMultiple) totalR += trade.rMultiple;

        // Distributions
        const date = trade.timestampEntry 
          ? new Date(trade.timestampEntry).toISOString().split("T")[0]
          : new Date(trade.createdAt).toISOString().split("T")[0];
        
        const currentDay = dateMap.get(date) || { pnl: 0, count: 0 };
        dateMap.set(date, { pnl: currentDay.pnl + pnl, count: currentDay.count + 1 });

        const symbol = trade.symbol || "UNKNOWN";
        const currentSym = symbolMap.get(symbol) || { count: 0, pnl: 0 };
        symbolMap.set(symbol, { count: currentSym.count + 1, pnl: currentSym.pnl + pnl });

        if (trade.emotion) {
          emotionCounts[trade.emotion] = (emotionCounts[trade.emotion] || 0) + 1;
        }
      });

      const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
      const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 100 : 0;
      const averageWin = winCount > 0 ? totalWinAmount / winCount : 0;
      const averageLoss = lossCount > 0 ? totalLossAmount / lossCount : 0;
      const expectancy = totalTrades > 0 ? ((winRate/100) * averageWin) - ((1 - (winRate/100)) * averageLoss) : 0;
      const averageR = totalTrades > 0 ? totalR / totalTrades : 0;

      // Find best and worst days
      let bestDay = null;
      let worstDay = null;
      let maxDailyPnL = -Infinity;
      let minDailyPnL = Infinity;
      const heatmapData: any[] = [];

      dateMap.forEach((value, date) => {
        heatmapData.push({ date, count: value.count, pnl: value.pnl });
        if (value.pnl > maxDailyPnL) {
          maxDailyPnL = value.pnl;
          bestDay = { date, pnl: value.pnl, count: value.count };
        }
        if (value.pnl < minDailyPnL) {
          minDailyPnL = value.pnl;
          worstDay = { date, pnl: value.pnl, count: value.count };
        }
      });

      // Prepare symbols distribution
      const distribution = Array.from(symbolMap.entries())
        .map(([name, val]) => ({
          name,
          count: val.count,
          pnl: val.pnl,
          percentage: Math.round((val.count / totalTrades) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      const activeBiases = (biases.biases || []).filter((b: any) => b.status === "active").length;
      const recentNews = (news.articles || []).slice(0, 3);
      const todaysSessions = (sessions.sessions || []).filter((s: any) => {
        const today = new Date().toISOString().split("T")[0];
        return s.date === today;
      });
      const researchNotes = research.total || 0;
      const chartSymbols = [...new Set(tradesArray.map((t: any) => t.symbol))].slice(0, 4);

      setData({
        totalTrades,
        totalPnL,
        winRate,
        activeBiases,
        recentNews,
        todaysSessions,
        researchNotes,
        chartSymbols: chartSymbols as string[],
        performanceStats: {
          averageWin,
          averageLoss,
          bestDay,
          worstDay,
          profitFactor,
          expectancy,
          averageR,
          maxDrawdown,
          wins: winCount,
          losses: lossCount,
          breakevens,
        },
        activityStats: {
          heatmap: heatmapData,
          distribution,
          summary: {
            mostActive: distribution[0]?.name || "N/A",
            totalPnL: totalPnL
          }
        },
        psychologyStats: {
          emotionBreakdown: emotionCounts,
          totalTrades,
        },
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set mock data on failure
      setData({
        totalTrades: 45,
        totalPnL: 1250.75,
        winRate: 68,
        activeBiases: 3,
        recentNews: [],
        todaysSessions: [],
        researchNotes: 12,
        chartSymbols: ["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD"],
        performanceStats: {
          averageWin: 150.5,
          averageLoss: -75.2,
          bestDay: { date: "2023-01-15", pnl: 500, count: 3 },
          worstDay: { date: "2023-01-20", pnl: -200, count: 2 },
          profitFactor: 1.8,
          expectancy: 45.5,
          averageR: 2.1,
          maxDrawdown: 350.0,
          wins: 25,
          losses: 15,
          breakevens: 5,
        },
        activityStats: {
          heatmap: [],
          distribution: [],
          summary: {
            mostActive: "N/A",
            totalPnL: 0,
          },
        },
        psychologyStats: {
          emotionBreakdown: {},
          totalTrades: 45,
        },
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

       {/* Main Dashboard Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) - Widgets */}
        <div className="lg:col-span-2 space-y-8">
          
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

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <ActivityMapWidget stats={data.activityStats} />
          </div>

          {/* Recent News & Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent News */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Newspaper size={20} className="text-green-400" />
                  Latest News
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
          </div>
        </div>

        {/* Right Column (1/3 width) - Sidebar Widgets */}
        <div className="space-y-8">
           {/* Quick Notes Widget */}
           <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 h-[400px]">
            <QuickNotesWidget />
          </div>

          {/* Performance Insights */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <PerformanceInsightsWidget stats={data.performanceStats} />
          </div>

          {/* Daily Habits */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <HabitsTrackerWidget />
          </div>

          {/* Goals Progress */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <GoalsProgressWidget />
          </div>

          {/* Psychology / Emotions */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <PsychologyWidget stats={data.psychologyStats} />
          </div>

          {/* Chart Symbols */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-400" />
                Frequently Traded
              </h3>
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
        </div>
      </div>
      
      {/* Integration Notice */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 mt-8">
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
