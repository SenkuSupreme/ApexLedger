"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TradingCalendar from "@/components/TradingCalendar";
import PortfolioSelector from "@/components/PortfolioSelector";
import { usePortfolios } from "@/context/PortfolioContext";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
} from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolios();
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetails, setDayDetails] = useState<any>(null);

  // Fetch calendar data
  const fetchCalendarData = async (portfolioId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (portfolioId && portfolioId !== "all") {
        params.append("portfolioId", portfolioId);
      }

      const res = await fetch(`/api/calendar?${params}`);
      const data = await res.json();
      setCalendarData(data);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed data for selected date
  const fetchDayDetails = async (date: string) => {
    try {
      const params = new URLSearchParams({
        startDate: date,
        endDate: date,
      });
      if (selectedPortfolioId && selectedPortfolioId !== "all") {
        params.append("portfolioId", selectedPortfolioId);
      }

      const res = await fetch(`/api/trades?${params}`);
      const data = await res.json();
      setDayDetails(data.trades || []);
    } catch (error) {
      console.error("Failed to fetch day details:", error);
    }
  };

  useEffect(() => {
    fetchCalendarData(selectedPortfolioId);
  }, [selectedPortfolioId]);

  useEffect(() => {
    if (selectedDate) {
      fetchDayDetails(selectedDate);
    }
  }, [selectedDate, selectedPortfolioId]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleViewJournal = () => {
    if (selectedDate) {
      router.push(`/journal?date=${selectedDate}`);
    }
  };

  // Calculate summary stats from calendar data
  const summaryStats = calendarData.reduce(
    (acc: any, day: any) => {
      acc.totalTrades += day.trades || 0;
      acc.totalPnl += day.pnl || 0;
      if (day.pnl > 0) acc.profitableDays++;
      if (day.trades > 0) acc.activeDays++;
      return acc;
    },
    { totalTrades: 0, totalPnl: 0, profitableDays: 0, activeDays: 0 }
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white flex items-center gap-3">
            <Calendar size={32} />
            Trading Calendar
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Visual overview of your trading activity and performance.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <PortfolioSelector
            currentId={selectedPortfolioId}
            onSelect={setSelectedPortfolioId}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {summaryStats.activeDays}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">
                Active Days
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Target size={20} className="text-white/60" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {summaryStats.totalTrades}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">
                Total Trades
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {summaryStats.profitableDays}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">
                Profitable Days
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`p-2 rounded-lg ${
                summaryStats.totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              }`}
            >
              {summaryStats.totalPnl >= 0 ? (
                <TrendingUp size={20} className="text-green-400" />
              ) : (
                <TrendingDown size={20} className="text-red-400" />
              )}
            </div>
            <div>
              <div
                className={`text-2xl font-bold ${
                  summaryStats.totalPnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                ${summaryStats.totalPnl.toFixed(0)}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">
                Total P&L
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 flex items-center justify-center h-96">
              <div className="text-white/60 font-mono text-sm">
                Loading calendar...
              </div>
            </div>
          ) : (
            <TradingCalendar
              data={calendarData}
              onDateSelect={handleDateSelect}
            />
          )}
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          {selectedDate ? (
            <>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                {dayDetails && dayDetails.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-white">
                          {dayDetails.length}
                        </div>
                        <div className="text-xs text-white/60">Trades</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div
                          className={`text-xl font-bold ${
                            dayDetails.reduce(
                              (sum: number, t: any) => sum + (t.pnl || 0),
                              0
                            ) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          $
                          {dayDetails
                            .reduce(
                              (sum: number, t: any) => sum + (t.pnl || 0),
                              0
                            )
                            .toFixed(0)}
                        </div>
                        <div className="text-xs text-white/60">P&L</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white/80">
                        Trades
                      </h4>
                      {dayDetails.slice(0, 5).map((trade: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-2 bg-white/5 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                (trade.pnl || 0) >= 0
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="text-sm text-white">
                              {trade.symbol}
                            </span>
                          </div>
                          <span
                            className={`text-sm font-bold ${
                              (trade.pnl || 0) >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {(trade.pnl || 0) >= 0 ? "+" : ""}$
                            {(trade.pnl || 0).toFixed(0)}
                          </span>
                        </div>
                      ))}
                      {dayDetails.length > 5 && (
                        <div className="text-xs text-white/60 text-center">
                          +{dayDetails.length - 5} more trades
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleViewJournal}
                      className="w-full bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      View in Journal
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-sm">
                      No trades recorded on this date
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <div className="text-center py-8">
                <Calendar size={48} className="text-white/20 mx-auto mb-4" />
                <div className="text-white/40 text-sm">
                  Select a date to view details
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
