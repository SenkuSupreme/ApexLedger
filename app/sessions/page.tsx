"use client";

import React, { useState, useEffect } from "react";
import {
  Timer,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  DollarSign,
  Target,
  Activity,
  Filter,
  Search,
  Plus,
  Eye,
} from "lucide-react";

interface SessionReview {
  _id: string;
  date: string;
  session: "sydney" | "tokyo" | "london" | "newyork";
  startTime: string;
  endTime: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  notes: string;
  mood: "excellent" | "good" | "neutral" | "poor" | "terrible";
  marketConditions: "trending" | "ranging" | "volatile" | "quiet";
  createdAt: string;
  relatedTrades?: any[];
  tradeCount?: number;
  biasAlignment?: string;
  derivedFromTrades?: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState("all");
  const [selectedMood, setSelectedMood] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Helper function to determine session from timestamp
  const getSessionFromTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hour = date.getHours();

    // Session times in UTC (approximate)
    if (hour >= 22 || hour < 6) return "sydney";
    if (hour >= 0 && hour < 8) return "tokyo";
    if (hour >= 8 && hour < 16) return "london";
    if (hour >= 13 && hour < 21) return "newyork";

    return "london"; // Default fallback
  };

  // Helper function to get session start time
  const getSessionStartTime = (session: string) => {
    const times = {
      sydney: "22:00",
      tokyo: "00:00",
      london: "08:00",
      newyork: "13:00",
    };
    return times[session as keyof typeof times] || "00:00";
  };

  // Helper function to get session end time
  const getSessionEndTime = (session: string) => {
    const times = {
      sydney: "06:00",
      tokyo: "08:00",
      london: "16:00",
      newyork: "21:00",
    };
    return times[session as keyof typeof times] || "23:59";
  };

  // Analyze trades by trading sessions
  const analyzeTradesBySessions = (trades: any[]) => {
    const sessionMap = new Map();

    trades.forEach((trade: any) => {
      if (!trade.timestampEntry) return;

      const session = getSessionFromTime(trade.timestampEntry);
      const date = new Date(trade.timestampEntry).toISOString().split("T")[0];
      const key = `${date}-${session}`;

      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          date,
          session,
          trades: [],
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalPnL: 0,
          bestTrade: -Infinity,
          worstTrade: Infinity,
        });
      }

      const sessionData = sessionMap.get(key);
      const pnl = trade.pnl || 0;

      sessionData.trades.push(trade);
      sessionData.totalTrades += 1;
      sessionData.totalPnL += pnl;

      if (pnl > 0) sessionData.winningTrades += 1;
      if (pnl < 0) sessionData.losingTrades += 1;
      if (pnl > sessionData.bestTrade) sessionData.bestTrade = pnl;
      if (pnl < sessionData.worstTrade) sessionData.worstTrade = pnl;
    });

    return Array.from(sessionMap.values()).map((session: any) => ({
      ...session,
      winRate:
        session.totalTrades > 0
          ? Math.round((session.winningTrades / session.totalTrades) * 100)
          : 0,
      bestTrade: session.bestTrade === -Infinity ? 0 : session.bestTrade,
      worstTrade: session.worstTrade === Infinity ? 0 : session.worstTrade,
    }));
  };

  const sessionTypes = [
    { id: "all", label: "All Sessions", color: "bg-white/10" },
    { id: "sydney", label: "Sydney", color: "bg-blue-500/20" },
    { id: "tokyo", label: "Tokyo", color: "bg-indigo-500/20" },
    { id: "london", label: "London", color: "bg-orange-500/20" },
    { id: "newyork", label: "New York", color: "bg-emerald-500/20" },
  ];

  const moodTypes = [
    { id: "all", label: "All Moods" },
    { id: "excellent", label: "Excellent", color: "text-green-400" },
    { id: "good", label: "Good", color: "text-blue-400" },
    { id: "neutral", label: "Neutral", color: "text-gray-400" },
    { id: "poor", label: "Poor", color: "text-orange-400" },
    { id: "terrible", label: "Terrible", color: "text-red-400" },
  ];

  // Fetch session reviews from journal entries
  const fetchSessions = async () => {
    try {
      setLoading(true);

      // Fetch both sessions and related journal entries
      const [sessionsRes, tradesRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/trades"),
      ]);

      const sessionsData = await sessionsRes.json();
      const tradesData = await tradesRes.json();

      // Analyze trades by session
      const sessionAnalytics = analyzeTradesBySessions(tradesData.trades || []);

      // Combine session data with analytics
      const sessionsWithAnalytics = (sessionsData.sessions || []).map(
        (session: any) => {
          const sessionDate = session.date;
          const sessionAnalytic = sessionAnalytics.find(
            (analytics: any) =>
              analytics.date === sessionDate &&
              analytics.session === session.session
          );

          return {
            ...session,
            ...sessionAnalytic,
            relatedTrades: sessionAnalytic?.trades || [],
            tradeCount: sessionAnalytic?.trades?.length || 0,
          };
        }
      );

      // Add pure analytics sessions (from trades without session reviews)
      const existingSessionKeys = new Set(
        sessionsWithAnalytics.map((s: any) => `${s.date}-${s.session}`)
      );

      const analyticsOnlySessions = sessionAnalytics
        .filter(
          (analytics: any) =>
            !existingSessionKeys.has(`${analytics.date}-${analytics.session}`)
        )
        .map((analytics: any) => ({
          _id: `analytics-${analytics.date}-${analytics.session}`,
          date: analytics.date,
          session: analytics.session,
          startTime: getSessionStartTime(analytics.session),
          endTime: getSessionEndTime(analytics.session),
          notes: `Auto-generated from ${analytics.totalTrades} trades`,
          mood:
            analytics.totalPnL > 0
              ? "good"
              : analytics.totalPnL < -50
              ? "poor"
              : "neutral",
          marketConditions:
            analytics.winRate > 70
              ? "trending"
              : analytics.winRate < 40
              ? "volatile"
              : "ranging",
          createdAt: new Date().toISOString(),
          ...analytics,
          derivedFromTrades: true,
        }));

      setSessions([...sessionsWithAnalytics, ...analyticsOnlySessions]);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      // Fallback to mock data
      setSessions([
        {
          _id: "1",
          date: new Date().toISOString().split("T")[0],
          session: "london",
          startTime: "13:45",
          endTime: "18:30",
          totalTrades: 5,
          winningTrades: 3,
          losingTrades: 2,
          totalPnL: 245.5,
          winRate: 60,
          bestTrade: 150.0,
          worstTrade: -85.0,
          notes:
            "Strong trending market during London session. Good momentum trades on EURUSD and GBPUSD.",
          mood: "good",
          marketConditions: "trending",
          createdAt: new Date().toISOString(),
          relatedTrades: [],
          tradeCount: 5,
          biasAlignment: "Strong - 4/5 trades aligned with morning bias",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.session.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSession =
      selectedSession === "all" || session.session === selectedSession;
    const matchesMood = selectedMood === "all" || session.mood === selectedMood;

    return matchesSearch && matchesSession && matchesMood;
  });

  // Calculate stats
  const totalPnL = sessions.reduce((acc, s) => acc + s.totalPnL, 0);
  const totalTrades = sessions.reduce((acc, s) => acc + s.totalTrades, 0);
  const avgWinRate =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.winRate, 0) / sessions.length
        )
      : 0;

  const getMoodColor = (mood: string) => {
    const moodType = moodTypes.find((m) => m.id === mood);
    return moodType?.color || "text-gray-400";
  };

  const getSessionColor = (session: string) => {
    const sessionType = sessionTypes.find((s) => s.id === session);
    return sessionType?.color || "bg-white/10";
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Session Reviews
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Analyze your trading performance by market session
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
        >
          <Plus size={18} />
          Add Session Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Timer size={20} className="text-blue-400" />
            <span className="text-sm text-white/60">Total Sessions</span>
          </div>
          <div className="text-2xl font-bold text-white">{sessions.length}</div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign
              size={20}
              className={totalPnL >= 0 ? "text-green-400" : "text-red-400"}
            />
            <span className="text-sm text-white/60">Total P&L</span>
          </div>
          <div
            className={`text-2xl font-bold ${
              totalPnL >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ${totalPnL.toFixed(2)}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={20} className="text-purple-400" />
            <span className="text-sm text-white/60">Total Trades</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalTrades}</div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-yellow-400" />
            <span className="text-sm text-white/60">Avg Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgWinRate}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Session Filter */}
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
        >
          {sessionTypes.map((session) => (
            <option key={session.id} value={session.id} className="bg-black">
              {session.label}
            </option>
          ))}
        </select>

        {/* Mood Filter */}
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
        >
          {moodTypes.map((mood) => (
            <option key={mood.id} value={mood.id} className="bg-black">
              {mood.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60">Loading session reviews...</p>
          </div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <Timer size={64} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Sessions Found
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm || selectedSession !== "all" || selectedMood !== "all"
              ? "Try adjusting your filters"
              : "Start documenting your trading sessions"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

// Session Card Component
function SessionCard({ session }: { session: SessionReview }) {
  const sessionType = {
    sydney: { name: "Sydney", color: "bg-blue-500/20 text-blue-400" },
    tokyo: { name: "Tokyo", color: "bg-indigo-500/20 text-indigo-400" },
    london: { name: "London", color: "bg-orange-500/20 text-orange-400" },
    newyork: { name: "New York", color: "bg-emerald-500/20 text-emerald-400" },
  };

  const moodEmoji = {
    excellent: "🚀",
    good: "😊",
    neutral: "😐",
    poor: "😔",
    terrible: "😡",
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Session Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                sessionType[session.session].color
              }`}
            >
              {sessionType[session.session].name}
            </span>
            <span className="text-2xl">{moodEmoji[session.mood]}</span>
          </div>

          <div className="text-sm text-white/60">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} />
              {new Date(session.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              {session.startTime} - {session.endTime}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div
              className={`text-xl font-bold ${
                session.totalPnL >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ${session.totalPnL.toFixed(2)}
            </div>
            <div className="text-xs text-white/60">Total P&L</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {session.winRate}%
            </div>
            <div className="text-xs text-white/60">Win Rate</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {session.totalTrades}
            </div>
            <div className="text-xs text-white/60">Total Trades</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              ${session.bestTrade.toFixed(2)}
            </div>
            <div className="text-xs text-white/60">Best Trade</div>
          </div>
        </div>

        {/* Notes and Bias Alignment */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-white/80 mb-2">
            Session Notes:
          </h4>
          <p className="text-sm text-white/70 line-clamp-4">{session.notes}</p>

          <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
            <span>Market: {session.marketConditions}</span>
            <span>
              W: {session.winningTrades} | L: {session.losingTrades}
            </span>
            <span>Worst: ${session.worstTrade.toFixed(2)}</span>
            {session.biasAlignment && (
              <span className="text-purple-400">
                Bias: {session.biasAlignment}
              </span>
            )}
          </div>

          {/* Related Trades Link */}
          {session.tradeCount !== undefined && session.tradeCount > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                onClick={() =>
                  window.open(`/journal?date=${session.date}`, "_blank")
                }
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Eye size={12} />
                View {session.tradeCount} related trades in journal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
