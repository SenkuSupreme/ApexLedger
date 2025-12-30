"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { BarChart2, PlusCircle } from "lucide-react";
import PortfolioSelector from "@/components/PortfolioSelector";
import DateRangePicker from "@/components/DateRangePicker";
import CreatePortfolioModal from "@/components/CreatePortfolioModal";
import ForexSessionNavbar from "@/components/ForexSessionNavbar";
import WidgetSystem from "@/components/WidgetSystem";
import { QuickNotesWidget, EquityCurveWidget } from "@/components/widgets";
import { usePortfolios } from "@/context/PortfolioContext";

export default function Dashboard() {
  const { data: session } = useSession();
  const {
    portfolios,
    loading: portfoliosLoading,
    refreshPortfolios,
    selectedPortfolioId,
    setSelectedPortfolioId,
  } = usePortfolios();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized fetcher for analytics stats
  const fetchStats = React.useCallback(
    async (id: string, range: { start: string; end: string }) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          portfolioId: id,
          ...(range.start && { startDate: range.start }),
          ...(range.end && { endDate: range.end }),
        });

        const res = await fetch(`/api/analytics?${queryParams}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sync data whenever filters change
  useEffect(() => {
    if (!portfoliosLoading && portfolios.length > 0) {
      fetchStats(selectedPortfolioId, dateRange);
    }
  }, [
    selectedPortfolioId,
    dateRange,
    portfoliosLoading,
    portfolios.length,
    fetchStats,
  ]);

  if (portfoliosLoading)
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Syncing Accounts...
      </div>
    );

  // Empty State View
  if (!portfoliosLoading && portfolios.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <ForexSessionNavbar />
        <div className="max-w-md space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <BarChart2 size={32} className="text-white/60" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            No Active Portfolios
          </h1>
          <p className="text-white/70 text-sm font-light leading-relaxed">
            You haven't initialized any trading accounts yet. Create your first
            portfolio to start tracking your performance.
          </p>
          <div className="pt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5 mx-auto"
            >
              <PlusCircle size={20} />
              CREATE YOUR FIRST PORTFOLIO
            </button>
          </div>
        </div>

        <CreatePortfolioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newPortfolio) => {
            refreshPortfolios();
            setSelectedPortfolioId(newPortfolio._id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-white/70 text-sm font-medium">
            Customizable trading performance analytics with moveable widgets.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({ start, end })}
          />
          <PortfolioSelector
            currentId={selectedPortfolioId}
            onSelect={setSelectedPortfolioId}
          />
        </div>
      </div>

      {/* Progress Overlay */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 z-100">
          <div className="h-full bg-blue-500 animate-progress origin-left" />
        </div>
      )}

      {/* Top Grid: Forex Sessions & Quick Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forex Session Navbar - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <ForexSessionNavbar />
        </div>

        {/* Quick Notes - Takes 1/3 width */}
        <div
          className={`transition-opacity duration-300 ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 h-[400px]">
            <QuickNotesWidget />
          </div>
        </div>
      </div>

      {/* Equity Curve - Full Width */}
      <div
        className={`transition-opacity duration-300 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 min-h-[450px] relative overflow-hidden group shadow-2xl">
          <EquityCurveWidget stats={stats} />

          {/* Background grid effect */}
          <div
            className="absolute inset-0 z-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
      </div>

      {/* Moveable Widgets Section */}
      <div
        className={`transition-opacity duration-300 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        <WidgetSystem stats={stats} loading={loading} />
      </div>
    </div>
  );
}
