"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateTradeMetrics } from "@/lib/utils/tradeCalculations";

interface Trade {
  _id: string;
  symbol: string;
  assetType: string;
  entryPrice: number;
  exitPrice: number;
  direction: "long" | "short";
  pnl: number;
  grossPnl?: number;
  rMultiple?: number;
  actualRR?: number;
  targetRR?: number;
  riskAmount?: number;
  stopLoss?: number;
  takeProfit?: number;
  timestampEntry: string;
  timestampExit?: string;
  quantity: number;
  fees?: number;
  outcome?: string;
  setupGrade?: number;
  emotion?: string;
  strategyId?: string;
  portfolioId?: string;
  strategy?: {
    _id: string;
    name: string;
    isTemplate?: boolean;
  };
  portfolio?: {
    _id: string;
    name: string;
    accountType: string;
  };
}

interface Column {
  id: string;
  label: string;
  sortable: boolean;
  width?: string;
}

export default function TradeList({
  initialPortfolioId = "",
  initialDateRange = { start: "", end: "" },
}: {
  initialPortfolioId?: string;
  initialDateRange?: { start: string; end: string };
}) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1 });
  const [filter, setFilter] = useState({
    symbol: "",
    status: "",
    portfolioId: initialPortfolioId,
    startDate: initialDateRange.start,
    endDate: initialDateRange.end,
  });
  const [sort, setSort] = useState({ field: "timestampEntry", order: "desc" });
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "date",
    "symbol",
    "account",
    "strategy",
    "type",
    "side",
    "quantity",
    "entry",
    "exit",
    "risk",
    "grade",
    "emotion",
    "pnl",
    "actions",
  ]);

  // Helper function to get correct P&L value (calculated if possible, otherwise stored)
  const getCorrectPnL = (trade: Trade) => {
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
        return {
          netPnl: metrics.netPnl,
          grossPnl: metrics.grossPnl,
        };
      } catch (error) {
        console.error("Error calculating P&L for trade:", trade._id, error);
      }
    }

    // Fallback to stored values
    return {
      netPnl: trade.pnl || 0,
      grossPnl: trade.grossPnl || trade.pnl || 0,
    };
  };

  const columns: Column[] = [
    { id: "date", label: "Date", sortable: true },
    { id: "symbol", label: "Symbol", sortable: true },
    { id: "account", label: "Account", sortable: false },
    { id: "strategy", label: "Strategy", sortable: false },
    { id: "type", label: "Type", sortable: false },
    { id: "side", label: "Side", sortable: false },
    { id: "quantity", label: "Quantity", sortable: false },
    { id: "entry", label: "Entry", sortable: false },
    { id: "exit", label: "Exit", sortable: false },
    { id: "risk", label: "Risk", sortable: false },
    { id: "grade", label: "Grade", sortable: false },
    { id: "emotion", label: "Emotion", sortable: false },
    { id: "pnl", label: "P&L", sortable: true },
    { id: "actions", label: "Actions", sortable: false },
  ];

  // Update internal filter when props change
  useEffect(() => {
    setFilter((prev: any) => {
      // Only update if values actually changed to prevent loops
      if (
        prev.portfolioId === initialPortfolioId &&
        prev.startDate === initialDateRange.start &&
        prev.endDate === initialDateRange.end
      ) {
        return prev;
      }
      return {
        ...prev,
        portfolioId: initialPortfolioId,
        startDate: initialDateRange.start,
        endDate: initialDateRange.end,
      };
    });
  }, [initialPortfolioId, initialDateRange.start, initialDateRange.end]);

  const fetchTrades = React.useCallback(() => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page: pagination.page.toString(),
      limit: "10",
      sort: sort.field,
      order: sort.order,
      symbol: filter.symbol,
      status: filter.status,
      ...(filter.portfolioId && { portfolioId: filter.portfolioId }),
      ...(filter.startDate && { startDate: filter.startDate }),
      ...(filter.endDate && { endDate: filter.endDate }),
    });

    fetch(`/api/trades?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.trades) {
          setTrades(data.trades);
          setPagination(data.pagination);
        } else {
          setTrades(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => console.error("Trade fetch error:", err))
      .finally(() => setLoading(false));
  }, [
    pagination.page,
    sort.field,
    sort.order,
    filter.symbol,
    filter.status,
    filter.portfolioId,
    filter.startDate,
    filter.endDate,
  ]);

  // Main effect for filter/sort/pagination changes
  useEffect(() => {
    // We only skip if it's strictly a symbol change (handled by debounce below)
    // but React's state updates are batched, so we need careful logic.
    fetchTrades();
  }, [
    pagination.page,
    sort.field,
    sort.order,
    filter.status,
    filter.portfolioId,
    filter.startDate,
    filter.endDate,
    fetchTrades,
  ]);

  const handleSort = (field: string) => {
    setSort((prev: any) => ({
      field,
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const newColumnOrder = [...columnOrder];
    const draggedIndex = newColumnOrder.indexOf(draggedColumn);
    const targetIndex = newColumnOrder.indexOf(targetColumnId);

    // Remove dragged column and insert at target position
    newColumnOrder.splice(draggedIndex, 1);
    newColumnOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newColumnOrder);
    setDraggedColumn(null);
  };

  const renderColumnHeader = (column: Column) => {
    const isBeingDragged = draggedColumn === column.id;

    return (
      <th
        key={column.id}
        className={`px-4 py-4 ${
          column.sortable ? "cursor-pointer hover:text-foreground group" : ""
        } transition-all relative ${
          isBeingDragged ? "opacity-30 bg-primary/10" : ""
        } hover:bg-foreground/[0.02]`}
        onClick={() =>
          column.sortable &&
          handleSort(
            column.id === "date"
              ? "timestampEntry"
              : column.id === "pnl"
              ? "pnl"
              : column.id
          )
        }
        draggable
        onDragStart={(e) => handleDragStart(e, column.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, column.id)}
      >
        <div className="flex items-center gap-2">
          {column.id !== "actions" && (
            <GripVertical
              size={10}
              className="text-white/20 group-hover:text-white/40 cursor-grab active:cursor-grabbing"
            />
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground group-hover:text-foreground transition-colors">
            {column.label}
          </span>
          {column.sortable && (
            <ArrowUpDown
              size={10}
              className="opacity-0 group-hover:opacity-60 transition-opacity"
            />
          )}
        </div>
        {isBeingDragged && (
          <div className="absolute inset-0 border-2 border-sky-500/50 rounded pointer-events-none"></div>
        )}
      </th>
    );
  };

  const renderCell = (trade: Trade, columnId: string) => {
    switch (columnId) {
      case "date":
        return (
          <td key={columnId} className="px-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-foreground font-black italic uppercase text-xs tracking-tighter tabular-nums">
                {new Date(trade.timestampEntry).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {new Date(trade.timestampEntry).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </td>
        );

      case "symbol":
        return (
          <td key={columnId} className="px-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="font-black text-foreground italic truncate max-w-[120px] uppercase tracking-tighter text-base leading-none">
                {trade.symbol}
              </span>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">
                {trade.assetType}
              </span>
            </div>
          </td>
        );

      case "account":
        return (
          <td key={columnId} className="px-4 py-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] italic">
                {trade.portfolio?.name || "Main Account"}
              </span>
            </div>
            {trade.portfolio?.accountType && (
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-3">
                {trade.portfolio.accountType}
              </div>
            )}
          </td>
        );

      case "strategy":
        return (
          <td key={columnId} className="px-4 py-4">
            {trade.strategy ? (
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                <Link
                  href={`/strategies/${trade.strategy._id}`}
                  className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] hover:text-purple-300 truncate max-w-[120px] italic"
                  title={trade.strategy.name}
                >
                  {trade.strategy.name}
                </Link>
                {trade.strategy.isTemplate && (
                  <span className="text-[8px] text-amber-500 font-black uppercase tracking-[0.2em] bg-amber-500/10 px-1 py-0.5 rounded">
                    BP
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">Manual Entry</span>
            )}
          </td>
        );

      case "type":
        return (
          <td key={columnId} className="px-4 py-4">
            <span className="text-xs text-gray-400 capitalize">
              {trade.assetType}
            </span>
          </td>
        );

      case "side":
        return (
          <td key={columnId} className="px-4 py-4">
            <span
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] italic ${
                trade.direction === "long"
                  ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/10"
                  : "bg-rose-500/5 text-rose-400 border border-rose-500/10"
              }`}
            >
              {trade.direction === 'long' ? 'Long' : 'Short'}
            </span>
          </td>
        );

      case "quantity":
        return (
          <td
            key={columnId}
            className="px-4 py-4"
          >
            <span className="text-foreground/80 font-black text-xs tabular-nums italic">
              {trade.quantity || "-"}
            </span>
          </td>
        );

      case "entry":
        return (
          <td key={columnId} className="px-4 py-4">
            <span className="text-blue-400 font-black italic tracking-tighter tabular-nums text-xs">
              {trade.entryPrice ? trade.entryPrice.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) : "-"}
            </span>
          </td>
        );

      case "exit":
        return (
          <td key={columnId} className="px-4 py-4 font-mono text-xs">
            <span className="text-purple-400 font-medium">
              {trade.exitPrice ? trade.exitPrice.toFixed(5) : "-"}
            </span>
          </td>
        );
      case "risk":
        let rMultiple = trade.rMultiple || 0;
        let riskAmount = trade.riskAmount || 0;

        if (trade.entryPrice && trade.quantity) {
          try {
            const metrics = calculateTradeMetrics({
              entryPrice: trade.entryPrice,
              exitPrice: trade.exitPrice,
              stopLoss: trade.stopLoss || 0,
              takeProfit: trade.takeProfit || 0,
              quantity: trade.quantity,
              direction: trade.direction || "long",
              portfolioBalance: 10000,
              fees: trade.fees || 0,
              assetType: trade.assetType || "forex",
              symbol: trade.symbol || "",
            });
            rMultiple = metrics.rMultiple;
            riskAmount = metrics.riskAmount;
          } catch (error) {
            rMultiple = trade.rMultiple || 0;
            riskAmount = trade.riskAmount || 0;
          }
        }

        return (
          <td key={columnId} className="px-4 py-4">
            <div className="flex flex-col gap-1">
              <span
                className={`text-sm font-black italic tracking-tighter tabular-nums ${
                  rMultiple >= 2 ? "text-emerald-400" : rMultiple >= 0 ? "text-amber-400" : "text-rose-400"
                }`}
              >
                {rMultiple ? `${rMultiple.toFixed(2)}R` : "---"}
              </span>
              {riskAmount > 0 && (
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
                  ${riskAmount.toFixed(0)} Risk
                </span>
              )}
            </div>
          </td>
        );

      case "grade":
        return (
          <td key={columnId} className="px-4 py-4">
            {trade.setupGrade ? (
              <div className="flex items-center">
                <div
                  className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border italic ${
                    trade.setupGrade >= 4
                      ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                      : trade.setupGrade >= 3
                      ? "bg-amber-500/5 text-amber-400 border-amber-500/10"
                      : "bg-rose-500/5 text-rose-400 border-rose-500/10"
                  }`}
                >
                  {trade.setupGrade === 5
                    ? "A+"
                    : trade.setupGrade === 4
                    ? "A Grade"
                    : trade.setupGrade === 3
                    ? "B Grade"
                    : trade.setupGrade === 2
                    ? "C Grade"
                    : "D Grade"}
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground/40 italic text-[10px] font-black">---</span>
            )}
          </td>
        );

      case "emotion":
        return (
          <td key={columnId} className="px-4 py-4 text-center">
            {trade.emotion ? (
              <div className="flex items-center justify-center">
                <span
                  className="text-lg hover:scale-110 transition-transform cursor-help"
                  title={trade.emotion}
                >
                  {trade.emotion === "confident"
                    ? "😎"
                    : trade.emotion === "nervous"
                    ? "😰"
                    : trade.emotion === "excited"
                    ? "🤩"
                    : trade.emotion === "frustrated"
                    ? "😤"
                    : trade.emotion === "calm"
                    ? "😌"
                    : trade.emotion === "greedy"
                    ? "🤑"
                    : trade.emotion === "fearful"
                    ? "😨"
                    : "😐"}
                </span>
              </div>
            ) : (
              <span className="text-gray-600">-</span>
            )}
          </td>
        );

      case "pnl":
        const pnlData = getCorrectPnL(trade);
        return (
          <td key={columnId} className="px-4 py-4">
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-base font-black italic tracking-tighter tabular-nums ${
                  pnlData.netPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {pnlData.netPnl >= 0 ? "+" : ""}${pnlData.netPnl.toFixed(2)}
              </span>
              {pnlData.grossPnl && pnlData.grossPnl !== pnlData.netPnl && (
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
                  Net P&L
                </span>
              )}
            </div>
          </td>
        );

      case "actions":
        return (
          <td key={columnId} className="px-4 py-4 text-right">
            <Link
              href={`/journal/${trade._id}`}
              className="inline-flex items-center px-4 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 transition-all hover:translate-x-1 group"
            >
              Details
              <ChevronRight size={14} className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />
            </Link>
          </td>
        );

      default:
        return (
          <td key={columnId} className="px-4 py-4">
            -
          </td>
        );
    }
  };

  if (loading && trades.length === 0)
    return (
      <div className="text-white text-center py-8 animate-pulse font-mono text-sm">
        LOADING TRADES...
      </div>
    );

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-2xl backdrop-blur-sm">
      {/* Toolbar */}
      <div className="p-6 border-b border-border bg-foreground/[0.02]">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                 placeholder="Search Symbol..."
                 className="bg-foreground/[0.05] border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none w-full sm:w-64 transition-all duration-200"
                 value={filter.symbol}
                 onChange={(e) =>
                   setFilter((prev: any) => ({ ...prev, symbol: e.target.value }))
                 }
              />
            </div>
            <select
              className="bg-foreground/[0.05] border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground focus:border-primary/50 outline-none transition-all duration-200 min-w-[140px]"
              value={filter.status}
              onChange={(e) =>
                setFilter((prev: any) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="" className="bg-background">All Outcomes</option>
              <option value="win" className="bg-background">Winners</option>
              <option value="loss" className="bg-background">Losers</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400 font-mono uppercase tracking-wider bg-white/5 px-3 py-2 rounded-lg border border-white/10">
              <span className="text-white font-semibold">{trades.length}</span>{" "}
              of{" "}
              <span className="text-sky-400 font-semibold">
                {pagination.total}
              </span>{" "}
              Trades
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <table className="w-full text-left text-sm text-gray-400 min-w-[1200px]">
          <thead className="bg-gradient-to-r from-[#0F0F0F] to-[#1A1A1A] uppercase font-medium text-xs tracking-wider border-b border-white/10 sticky top-0 z-10">
            <tr>
              {columnOrder.map((columnId) => {
                const column = columns.find((c) => c.id === columnId);
                return column ? renderColumnHeader(column) : null;
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {trades.map((trade) => (
              <tr
                key={trade._id}
                className="hover:bg-gradient-to-r hover:from-white/[0.02] hover:to-white/[0.01] transition-all duration-200 group border-l-2 border-transparent hover:border-l-sky-500/50"
              >
                {columnOrder.map((columnId) => renderCell(trade, columnId))}
              </tr>
            ))}
          </tbody>
        </table>

        {trades.length === 0 && !loading && (
          <div className="p-16 text-center border-t border-white/5">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Trades Found
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                No trading records match your current filters. Try adjusting
                your search criteria or add your first trade.
              </p>
              <Link
                href="/journal/new"
                className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
              >
                Add First Trade
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-6 border-t border-white/10 bg-gradient-to-r from-white/[0.02] to-white/[0.01]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((prev: any) => ({ ...prev, page: prev.page - 1 }))
            }
            className="px-6 py-2.5 bg-black/50 border border-white/20 rounded-lg text-sm hover:bg-black/70 hover:border-white/30 disabled:opacity-50 disabled:hover:bg-black/50 disabled:hover:border-white/20 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Page{" "}
              <span className="text-white font-semibold">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="text-sky-400 font-semibold">
                {pagination.pages}
              </span>
            </span>
          </div>

          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() =>
              setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }))
            }
            className="px-6 py-2.5 bg-black/50 border border-white/20 rounded-lg text-sm hover:bg-black/70 hover:border-white/30 disabled:opacity-50 disabled:hover:bg-black/50 disabled:hover:border-white/20 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
