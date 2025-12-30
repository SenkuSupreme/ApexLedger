"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Users,
  Layers,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

interface Strategy {
  _id: string;
  name: string;
  description?: string;
  coreInfo?: {
    marketFocus: string[];
    instrumentFocus: string[];
    timeframes: string[];
    riskProfile: string;
  };
  blocks?: any[];
  isTemplate?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Trade {
  _id: string;
  symbol: string;
  direction: "long" | "short";
  pnl: number;
  rMultiple: number;
  timestampEntry: string;
  outcome: string;
}

export default function StrategyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchStrategy();
    fetchStrategyTrades();
  }, [id]);

  const fetchStrategy = async () => {
    try {
      const res = await fetch(`/api/strategies/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStrategy(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategyTrades = async () => {
    try {
      const res = await fetch(`/api/trades?strategyId=${id}&limit=50`);
      if (!res.ok) throw new Error("Failed to fetch trades");
      const data = await res.json();
      setTrades(data.trades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTradesLoading(false);
    }
  };

  // Calculate strategy performance metrics
  const calculateMetrics = () => {
    if (trades.length === 0) return null;

    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl < 0);

    const winRate = (winningTrades.length / totalTrades) * 100;
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgWin =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) /
          winningTrades.length
        : 0;
    const avgLoss =
      losingTrades.length > 0
        ? Math.abs(
            losingTrades.reduce((sum, t) => sum + t.pnl, 0) /
              losingTrades.length
          )
        : 0;
    const profitFactor =
      avgLoss > 0
        ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length)
        : 0;
    const avgRMultiple =
      trades.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / totalTrades;

    return {
      totalTrades,
      winRate,
      totalPnl,
      avgWin,
      avgLoss,
      profitFactor,
      avgRMultiple,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Strategy...
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60">
        <div className="text-center space-y-4">
          <AlertTriangle size={48} className="mx-auto text-red-500/60" />
          <h2 className="text-xl font-bold">Strategy Not Found</h2>
          <Link href="/strategies" className="text-sky-500 hover:text-sky-400">
            ← Back to Strategies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {strategy.name}
              {strategy.isTemplate && (
                <span className="px-3 py-1 rounded-lg text-sm font-bold bg-amber-500/20 text-amber-400">
                  BLUEPRINT
                </span>
              )}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Created {new Date(strategy.createdAt).toLocaleDateString()} • Last
              updated {new Date(strategy.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/strategies`}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 transition-colors"
          >
            <Edit3 size={16} />
            Edit Strategy
          </Link>
        </div>
      </div>

      {/* Performance Overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 size={20} className="text-blue-500" />
              <span className="text-2xl font-bold text-white">
                {metrics.totalTrades}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Total Trades
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target size={20} className="text-green-500" />
              <span className="text-2xl font-bold text-green-400">
                {metrics.winRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Win Rate
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={20} className="text-purple-500" />
              <span
                className={`text-2xl font-bold ${
                  metrics.totalPnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {metrics.totalPnl >= 0 ? "+" : ""}${metrics.totalPnl.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Total P&L
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users size={20} className="text-amber-500" />
              <span className="text-2xl font-bold text-white">
                {metrics.profitFactor.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Profit Factor
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target size={20} className="text-sky-500" />
              <span className="text-2xl font-bold text-white">
                {metrics.avgRMultiple.toFixed(2)}R
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Avg R-Multiple
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-2xl font-bold text-green-400">
                ${metrics.avgWin.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Avg Win
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={20} className="text-red-500" />
              <span className="text-2xl font-bold text-red-400">
                ${metrics.avgLoss.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Avg Loss
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strategy Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Core Information */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Layers size={20} />
              Strategy Overview
            </h3>

            {strategy.description && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white/80 mb-2">
                  Description
                </h4>
                <p className="text-white/70 leading-relaxed">
                  {strategy.description}
                </p>
              </div>
            )}

            {strategy.coreInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-3">
                    Market Focus
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.coreInfo.marketFocus?.map((market, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-xs font-medium"
                      >
                        {market}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-3">
                    Instruments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.coreInfo.instrumentFocus?.map(
                      (instrument, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-medium"
                        >
                          {instrument}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-3">
                    Timeframes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.coreInfo.timeframes?.map((timeframe, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium"
                      >
                        {timeframe}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-3">
                    Risk Profile
                  </h4>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">
                    {strategy.coreInfo.riskProfile || "Not specified"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Strategy Content */}
          {strategy.blocks && strategy.blocks.length > 0 && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen size={20} />
                Strategy Content
              </h3>

              <div className="space-y-4">
                {strategy.blocks.map((block, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                      {block.content || "No content"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="space-y-8">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Clock size={18} />
              Recent Trades
            </h3>

            {tradesLoading ? (
              <div className="text-center py-8 text-white/60 text-sm">
                Loading trades...
              </div>
            ) : trades.length > 0 ? (
              <div className="space-y-3">
                {trades.slice(0, 10).map((trade) => (
                  <Link
                    key={trade._id}
                    href={`/journal/${trade._id}`}
                    className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {trade.symbol}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.direction === "long"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {trade.direction.toUpperCase()}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-sm font-bold ${
                          trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>
                        {new Date(trade.timestampEntry).toLocaleDateString()}
                      </span>
                      <span>{trade.rMultiple?.toFixed(2) || "0.00"}R</span>
                    </div>
                  </Link>
                ))}

                {trades.length > 10 && (
                  <Link
                    href={`/journal?strategyId=${id}`}
                    className="block text-center py-3 text-sky-400 hover:text-sky-300 text-sm font-medium"
                  >
                    View all {trades.length} trades →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60 text-sm">
                No trades found for this strategy
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {metrics && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-6">Quick Stats</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Winning Trades</span>
                  <span className="text-green-400 font-mono font-bold">
                    {metrics.winningTrades}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Losing Trades</span>
                  <span className="text-red-400 font-mono font-bold">
                    {metrics.losingTrades}
                  </span>
                </div>

                <div className="h-px bg-white/10"></div>

                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Best Trade</span>
                  <span className="text-green-400 font-mono font-bold">
                    ${Math.max(...trades.map((t) => t.pnl)).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Worst Trade</span>
                  <span className="text-red-400 font-mono font-bold">
                    ${Math.min(...trades.map((t) => t.pnl)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
