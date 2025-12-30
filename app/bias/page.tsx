"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  BarChart3,
  Plus,
  Search,
  Edit3,
  Trash2,
} from "lucide-react";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface BiasEntry {
  _id: string;
  date: string;
  symbol: string;
  bias: "bullish" | "bearish" | "neutral";
  timeframe: string;
  confidence: number;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  technicalFactors: string[];
  fundamentalFactors: string[];
  riskFactors: string[];
  targetPrice: number;
  invalidationLevel: number;
  notes: string;
  status: "active" | "hit" | "invalidated" | "expired";
  createdAt: string;
  updatedAt: string;
  derivedFromTrades?: boolean;
  tradeCount?: number;
  successRate?: number;
}

export default function BiasPage() {
  const [biases, setBiases] = useState<BiasEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBias, setEditingBias] = useState<BiasEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    bias: BiasEntry | null;
  }>({ isOpen: false, bias: null });

  // Editor state
  const [editorData, setEditorData] = useState({
    symbol: "EURUSD",
    bias: "bullish" as "bullish" | "bearish" | "neutral",
    timeframe: "D1",
    confidence: 70,
    keyLevels: {
      support: [] as number[],
      resistance: [] as number[],
    },
    technicalFactors: [] as string[],
    fundamentalFactors: [] as string[],
    riskFactors: [] as string[],
    targetPrice: 0,
    invalidationLevel: 0,
    notes: "",
    status: "active" as "active" | "hit" | "invalidated" | "expired",
  });

  const symbols = [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "AUDUSD",
    "USDCAD",
    "NZDUSD",
    "USDCHF",
    "XAUUSD",
    "BTCUSD",
    "ETHUSD",
  ];

  const timeframes = ["M15", "H1", "H4", "D1", "W1"];

  const commonTechnicalFactors = [
    "Higher highs and higher lows",
    "Break of key resistance",
    "Bullish divergence on RSI",
    "Golden cross (50 MA above 200 MA)",
    "Support holding strong",
    "Volume confirmation",
    "Breakout from consolidation",
    "Trend line break",
    "Flag/pennant pattern",
    "Double bottom formation",
  ];

  const commonFundamentalFactors = [
    "Central bank hawkish stance",
    "Strong economic data",
    "Interest rate differential",
    "Risk-on sentiment",
    "Commodity price correlation",
    "Geopolitical stability",
    "Currency intervention risk",
    "Economic calendar events",
    "Market sentiment shift",
    "Safe haven demand",
  ];

  const commonRiskFactors = [
    "Central bank meeting this week",
    "Major economic data release",
    "Geopolitical tensions",
    "Market holiday approaching",
    "Low liquidity conditions",
    "Correlation breakdown risk",
    "Technical level failure",
    "News event risk",
    "Seasonal factors",
    "Market structure change",
  ];

  // Fetch bias entries derived from journal entries
  const fetchBiases = async () => {
    try {
      setLoading(true);

      // Fetch both bias entries and journal trades to derive bias data
      const [biasRes, tradesRes] = await Promise.all([
        fetch("/api/bias"),
        fetch("/api/trades"),
      ]);

      const biasData = await biasRes.json();
      const tradesData = await tradesRes.json();

      // Derive bias entries from journal trades
      const derivedBiases = deriveBiasFromTrades(tradesData.trades || []);

      // Combine existing bias entries with derived ones
      const allBiases = [...(biasData.biases || []), ...derivedBiases];

      setBiases(allBiases);
    } catch (error) {
      console.error("Failed to fetch bias entries:", error);
      // Mock data for demonstration
      setBiases([
        {
          _id: "1",
          date: new Date().toISOString().split("T")[0],
          symbol: "EURUSD",
          bias: "bullish",
          timeframe: "D1",
          confidence: 75,
          keyLevels: {
            support: [1.085, 1.08],
            resistance: [1.095, 1.1],
          },
          technicalFactors: [
            "Break of key resistance at 1.0920",
            "Bullish divergence on RSI",
            "Higher highs and higher lows",
          ],
          fundamentalFactors: [
            "ECB hawkish stance",
            "Strong eurozone data",
            "USD weakness",
          ],
          riskFactors: ["Fed meeting next week", "US CPI data release"],
          targetPrice: 1.105,
          invalidationLevel: 1.082,
          notes:
            "Strong bullish momentum after breaking key resistance. Watch for continuation above 1.0950. Derived from 3 successful long trades.",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          derivedFromTrades: true,
          tradeCount: 3,
          successRate: 100,
        },
        {
          _id: "2",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          symbol: "XAUUSD",
          bias: "bearish",
          timeframe: "H4",
          confidence: 60,
          keyLevels: {
            support: [1980, 1960],
            resistance: [2020, 2040],
          },
          technicalFactors: [
            "Failed to break 2020 resistance",
            "Bearish divergence forming",
            "Lower highs pattern",
          ],
          fundamentalFactors: [
            "USD strength",
            "Rising yields",
            "Risk-on sentiment",
          ],
          riskFactors: ["Geopolitical tensions", "Inflation data pending"],
          targetPrice: 1950,
          invalidationLevel: 2025,
          notes:
            "Gold showing weakness after failing to break key resistance. Target lower levels. Derived from 2 short trades with mixed results.",
          status: "active",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          derivedFromTrades: true,
          tradeCount: 2,
          successRate: 50,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to derive bias from journal trades
  const deriveBiasFromTrades = (trades: any[]) => {
    const symbolGroups = trades.reduce((acc: any, trade: any) => {
      const symbol = trade.symbol;
      const date = new Date(trade.timestampEntry).toISOString().split("T")[0];
      const key = `${symbol}-${date}`;

      if (!acc[key]) {
        acc[key] = {
          symbol,
          date,
          trades: [],
          longTrades: 0,
          shortTrades: 0,
          winningTrades: 0,
          totalPnL: 0,
        };
      }

      acc[key].trades.push(trade);
      if (trade.direction === "long") acc[key].longTrades++;
      if (trade.direction === "short") acc[key].shortTrades++;
      if ((trade.pnl || 0) > 0) acc[key].winningTrades++;
      acc[key].totalPnL += trade.pnl || 0;

      return acc;
    }, {});

    return Object.values(symbolGroups).map((group: any) => {
      const bias =
        group.longTrades > group.shortTrades
          ? "bullish"
          : group.shortTrades > group.longTrades
          ? "bearish"
          : "neutral";

      const confidence = Math.min(
        90,
        Math.max(50, (group.winningTrades / group.trades.length) * 100)
      );

      return {
        _id: `derived-${group.symbol}-${group.date}`,
        date: group.date,
        symbol: group.symbol,
        bias,
        timeframe: "D1",
        confidence: Math.round(confidence),
        keyLevels: {
          support: [],
          resistance: [],
        },
        technicalFactors: [`Derived from ${group.trades.length} trades`],
        fundamentalFactors: [],
        riskFactors: [],
        targetPrice: 0,
        invalidationLevel: 0,
        notes: `Bias derived from ${group.trades.length} trades. ${
          group.winningTrades
        } winners, P&L: $${group.totalPnL.toFixed(2)}`,
        status: group.totalPnL > 0 ? "hit" : "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        derivedFromTrades: true,
        tradeCount: group.trades.length,
        successRate: Math.round(
          (group.winningTrades / group.trades.length) * 100
        ),
      };
    });
  };

  useEffect(() => {
    fetchBiases();
  }, []);

  // Filter biases
  const filteredBiases = biases.filter((bias) => {
    const matchesSearch =
      bias.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bias.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSymbol =
      selectedSymbol === "all" || bias.symbol === selectedSymbol;
    const matchesStatus =
      selectedStatus === "all" || bias.status === selectedStatus;

    return matchesSearch && matchesSymbol && matchesStatus;
  });

  // Handle editor
  const openEditor = (bias?: BiasEntry) => {
    if (bias) {
      setEditingBias(bias);
      setEditorData({
        symbol: bias.symbol,
        bias: bias.bias,
        timeframe: bias.timeframe,
        confidence: bias.confidence,
        keyLevels: bias.keyLevels,
        technicalFactors: bias.technicalFactors,
        fundamentalFactors: bias.fundamentalFactors,
        riskFactors: bias.riskFactors,
        targetPrice: bias.targetPrice,
        invalidationLevel: bias.invalidationLevel,
        notes: bias.notes,
        status: bias.status,
      });
    } else {
      setEditingBias(null);
      setEditorData({
        symbol: "EURUSD",
        bias: "bullish",
        timeframe: "D1",
        confidence: 70,
        keyLevels: { support: [], resistance: [] },
        technicalFactors: [],
        fundamentalFactors: [],
        riskFactors: [],
        targetPrice: 0,
        invalidationLevel: 0,
        notes: "",
        status: "active",
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingBias(null);
  };

  const saveBias = async () => {
    try {
      const method = editingBias ? "PUT" : "POST";
      const url = editingBias ? `/api/bias/${editingBias._id}` : "/api/bias";

      const dataToSave = {
        ...editorData,
        date: new Date().toISOString().split("T")[0],
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        fetchBiases();
        closeEditor();
      }
    } catch (error) {
      console.error("Failed to save bias:", error);
    }
  };

  const deleteBias = async (id: string) => {
    try {
      const res = await fetch(`/api/bias/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBiases();
        setDeleteDialog({ isOpen: false, bias: null });
      }
    } catch (error) {
      console.error("Failed to delete bias:", error);
    }
  };

  const addFactor = (
    type: "technical" | "fundamental" | "risk",
    factor: string
  ) => {
    if (factor && !editorData[`${type}Factors`].includes(factor)) {
      setEditorData({
        ...editorData,
        [`${type}Factors`]: [...editorData[`${type}Factors`], factor],
      });
    }
  };

  const removeFactor = (
    type: "technical" | "fundamental" | "risk",
    factorToRemove: string
  ) => {
    setEditorData({
      ...editorData,
      [`${type}Factors`]: editorData[`${type}Factors`].filter(
        (f) => f !== factorToRemove
      ),
    });
  };

  const addLevel = (type: "support" | "resistance", level: number) => {
    if (level && !editorData.keyLevels[type].includes(level)) {
      setEditorData({
        ...editorData,
        keyLevels: {
          ...editorData.keyLevels,
          [type]: [...editorData.keyLevels[type], level].sort((a, b) =>
            type === "support" ? b - a : a - b
          ),
        },
      });
    }
  };

  const removeLevel = (
    type: "support" | "resistance",
    levelToRemove: number
  ) => {
    setEditorData({
      ...editorData,
      keyLevels: {
        ...editorData.keyLevels,
        [type]: editorData.keyLevels[type].filter((l) => l !== levelToRemove),
      },
    });
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case "bullish":
        return "text-green-400 bg-green-500/20";
      case "bearish":
        return "text-red-400 bg-red-500/20";
      case "neutral":
        return "text-gray-400 bg-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-blue-400 bg-blue-500/20";
      case "hit":
        return "text-green-400 bg-green-500/20";
      case "invalidated":
        return "text-red-400 bg-red-500/20";
      case "expired":
        return "text-gray-400 bg-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Market Bias Review
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Track your daily market bias and directional analysis
          </p>
        </div>

        <button
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
        >
          <Plus size={18} />
          New Bias Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain size={20} className="text-blue-400" />
            <span className="text-sm text-white/60">Total Biases</span>
          </div>
          <div className="text-2xl font-bold text-white">{biases.length}</div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-green-400" />
            <span className="text-sm text-white/60">Hit Target</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {biases.filter((b) => b.status === "hit").length}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-red-400" />
            <span className="text-sm text-white/60">Invalidated</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {biases.filter((b) => b.status === "invalidated").length}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-purple-400" />
            <span className="text-sm text-white/60">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {biases.length > 0
              ? Math.round(
                  (biases.filter((b) => b.status === "hit").length /
                    biases.length) *
                    100
                )
              : 0}
            %
          </div>
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
            placeholder="Search biases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Symbol Filter */}
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
        >
          <option value="all" className="bg-black">
            All Symbols
          </option>
          {symbols.map((symbol) => (
            <option key={symbol} value={symbol} className="bg-black">
              {symbol}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
        >
          <option value="all" className="bg-black">
            All Status
          </option>
          <option value="active" className="bg-black">
            Active
          </option>
          <option value="hit" className="bg-black">
            Hit Target
          </option>
          <option value="invalidated" className="bg-black">
            Invalidated
          </option>
          <option value="expired" className="bg-black">
            Expired
          </option>
        </select>
      </div>

      {/* Bias Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60">Loading bias entries...</p>
          </div>
        </div>
      ) : filteredBiases.length === 0 ? (
        <div className="text-center py-12">
          <Brain size={64} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Bias Entries Found
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm || selectedSymbol !== "all" || selectedStatus !== "all"
              ? "Try adjusting your filters"
              : "Start documenting your market bias and directional analysis"}
          </p>
          {!searchTerm &&
            selectedSymbol === "all" &&
            selectedStatus === "all" && (
              <button
                onClick={() => openEditor()}
                className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Create Your First Bias Entry
              </button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBiases.map((bias) => (
            <BiasCard
              key={bias._id}
              bias={bias}
              onEdit={() => openEditor(bias)}
              onDelete={() =>
                setDeleteDialog({
                  isOpen: true,
                  bias: bias,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {editingBias ? "Edit Bias Entry" : "New Bias Entry"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveBias}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={closeEditor}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Symbol
                  </label>
                  <select
                    value={editorData.symbol}
                    onChange={(e) =>
                      setEditorData({ ...editorData, symbol: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  >
                    {symbols.map((symbol) => (
                      <option key={symbol} value={symbol} className="bg-black">
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Bias
                  </label>
                  <select
                    value={editorData.bias}
                    onChange={(e) =>
                      setEditorData({
                        ...editorData,
                        bias: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="bullish" className="bg-black">
                      Bullish
                    </option>
                    <option value="bearish" className="bg-black">
                      Bearish
                    </option>
                    <option value="neutral" className="bg-black">
                      Neutral
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={editorData.timeframe}
                    onChange={(e) =>
                      setEditorData({
                        ...editorData,
                        timeframe: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  >
                    {timeframes.map((tf) => (
                      <option key={tf} value={tf} className="bg-black">
                        {tf}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Confidence ({editorData.confidence}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editorData.confidence}
                    onChange={(e) =>
                      setEditorData({
                        ...editorData,
                        confidence: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Price Levels */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Target Price
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={editorData.targetPrice || ""}
                    onChange={(e) =>
                      setEditorData({
                        ...editorData,
                        targetPrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                    placeholder="Enter target price..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Invalidation Level
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={editorData.invalidationLevel || ""}
                    onChange={(e) =>
                      setEditorData({
                        ...editorData,
                        invalidationLevel: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                    placeholder="Enter invalidation level..."
                  />
                </div>
              </div>

              {/* Key Levels */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Support Levels
                  </label>
                  <div className="space-y-2">
                    {editorData.keyLevels.support.map((level, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-white">
                          {level}
                        </span>
                        <button
                          onClick={() => removeLevel("support", level)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="Add support level..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const value = parseFloat(
                            (e.target as HTMLInputElement).value
                          );
                          if (value) {
                            addLevel("support", value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Resistance Levels
                  </label>
                  <div className="space-y-2">
                    {editorData.keyLevels.resistance.map((level, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-white">
                          {level}
                        </span>
                        <button
                          onClick={() => removeLevel("resistance", level)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="Add resistance level..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const value = parseFloat(
                            (e.target as HTMLInputElement).value
                          );
                          if (value) {
                            addLevel("resistance", value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-6">
                {/* Technical Factors */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Technical Factors
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editorData.technicalFactors.map((factor, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                        >
                          {factor}
                          <button
                            onClick={() => removeFactor("technical", factor)}
                            className="text-blue-300 hover:text-blue-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addFactor("technical", e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="" className="bg-black">
                        Select technical factor...
                      </option>
                      {commonTechnicalFactors.map((factor) => (
                        <option
                          key={factor}
                          value={factor}
                          className="bg-black"
                        >
                          {factor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fundamental Factors */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Fundamental Factors
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editorData.fundamentalFactors.map((factor, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                        >
                          {factor}
                          <button
                            onClick={() => removeFactor("fundamental", factor)}
                            className="text-green-300 hover:text-green-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addFactor("fundamental", e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="" className="bg-black">
                        Select fundamental factor...
                      </option>
                      {commonFundamentalFactors.map((factor) => (
                        <option
                          key={factor}
                          value={factor}
                          className="bg-black"
                        >
                          {factor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Risk Factors
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editorData.riskFactors.map((factor, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm"
                        >
                          {factor}
                          <button
                            onClick={() => removeFactor("risk", factor)}
                            className="text-red-300 hover:text-red-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addFactor("risk", e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="" className="bg-black">
                        Select risk factor...
                      </option>
                      {commonRiskFactors.map((factor) => (
                        <option
                          key={factor}
                          value={factor}
                          className="bg-black"
                        >
                          {factor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Notes
                </label>
                <textarea
                  value={editorData.notes}
                  onChange={(e) =>
                    setEditorData({ ...editorData, notes: e.target.value })
                  }
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                  placeholder="Add your analysis notes..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, bias: null })}
        onConfirm={() => {
          if (deleteDialog.bias) {
            deleteBias(deleteDialog.bias._id);
          }
        }}
        title="Delete Bias Entry"
        message={`Are you sure you want to delete the ${deleteDialog.bias?.bias} bias for ${deleteDialog.bias?.symbol}? This action cannot be undone.`}
      />
    </div>
  );
}

// Bias Card Component
function BiasCard({
  bias,
  onEdit,
  onDelete,
}: {
  bias: BiasEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getBiasColor = (biasType: string) => {
    switch (biasType) {
      case "bullish":
        return "text-green-400 bg-green-500/20";
      case "bearish":
        return "text-red-400 bg-red-500/20";
      case "neutral":
        return "text-gray-400 bg-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-blue-400 bg-blue-500/20";
      case "hit":
        return "text-green-400 bg-green-500/20";
      case "invalidated":
        return "text-red-400 bg-red-500/20";
      case "expired":
        return "text-gray-400 bg-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getBiasIcon = (biasType: string) => {
    switch (biasType) {
      case "bullish":
        return <TrendingUp size={16} />;
      case "bearish":
        return <TrendingDown size={16} />;
      case "neutral":
        return <BarChart3 size={16} />;
      default:
        return <BarChart3 size={16} />;
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">{bias.symbol}</h3>
          <span
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getBiasColor(
              bias.bias
            )}`}
          >
            {getBiasIcon(bias.bias)}
            {bias.bias.toUpperCase()}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
              bias.status
            )}`}
          >
            {bias.status.toUpperCase()}
          </span>
          {(bias as any).derivedFromTrades && (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
              FROM TRADES
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
            Timeframe
          </div>
          <div className="text-sm font-medium text-white">{bias.timeframe}</div>
        </div>
        <div>
          <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
            Confidence
          </div>
          <div className="text-sm font-medium text-white">
            {bias.confidence}%
          </div>
        </div>
        {(bias as any).derivedFromTrades ? (
          <>
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                Trade Count
              </div>
              <div className="text-sm font-medium text-white">
                {(bias as any).tradeCount} trades
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                Success Rate
              </div>
              <div className="text-sm font-medium text-white">
                {(bias as any).successRate}%
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                Target
              </div>
              <div className="text-sm font-medium text-white">
                {bias.targetPrice || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                Invalidation
              </div>
              <div className="text-sm font-medium text-white">
                {bias.invalidationLevel || "N/A"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Key Levels */}
      {(bias.keyLevels.support.length > 0 ||
        bias.keyLevels.resistance.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {bias.keyLevels.support.length > 0 && (
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-2">
                Support
              </div>
              <div className="space-y-1">
                {bias.keyLevels.support.slice(0, 2).map((level, index) => (
                  <div key={index} className="text-sm text-green-400 font-mono">
                    {level}
                  </div>
                ))}
                {bias.keyLevels.support.length > 2 && (
                  <div className="text-xs text-white/40">
                    +{bias.keyLevels.support.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}

          {bias.keyLevels.resistance.length > 0 && (
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-2">
                Resistance
              </div>
              <div className="space-y-1">
                {bias.keyLevels.resistance.slice(0, 2).map((level, index) => (
                  <div key={index} className="text-sm text-red-400 font-mono">
                    {level}
                  </div>
                ))}
                {bias.keyLevels.resistance.length > 2 && (
                  <div className="text-xs text-white/40">
                    +{bias.keyLevels.resistance.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Factors Summary */}
      <div className="space-y-2 mb-4">
        {bias.technicalFactors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-400 font-medium">
              Technical:
            </span>
            <span className="text-xs text-white/70">
              {bias.technicalFactors.length} factors
            </span>
          </div>
        )}
        {bias.fundamentalFactors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-400 font-medium">
              Fundamental:
            </span>
            <span className="text-xs text-white/70">
              {bias.fundamentalFactors.length} factors
            </span>
          </div>
        )}
        {bias.riskFactors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400 font-medium">Risk:</span>
            <span className="text-xs text-white/70">
              {bias.riskFactors.length} factors
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {bias.notes && (
        <div className="mb-4">
          <p className="text-sm text-white/70 line-clamp-3">{bias.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="space-y-2">
        {/* Trade Statistics for derived biases */}
        {(bias as any).derivedFromTrades && (
          <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-purple-400 font-medium">
                {(bias as any).tradeCount} trades
              </span>
              <span className="text-white/60">
                {(bias as any).successRate}% success rate
              </span>
            </div>
            <button
              onClick={() =>
                window.open(
                  `/journal?symbol=${bias.symbol}&date=${bias.date}`,
                  "_blank"
                )
              }
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              View Trades →
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(bias.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(bias.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
