"use client";

import { useState } from "react";
import Link from "next/link";
import TradeList from "@/components/TradeList";
import { Plus } from "lucide-react";
import PortfolioSelector from "@/components/PortfolioSelector";
import DateRangePicker from "@/components/DateRangePicker";
import NewTradeDialog from "@/components/NewTradeDialog";
import { usePortfolios } from "@/context/PortfolioContext";

export default function JournalPage() {
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolios();
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Journal
          </h1>
          <p className="text-gray-400 text-sm">
            Operation history and performance audit
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
          <button
            onClick={() => setIsNewTradeOpen(true)}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-white/5 active:scale-95"
          >
            <Plus size={18} />
            NEW TRADE
          </button>
        </div>
      </header>

      <TradeList
        key={refreshKey}
        initialPortfolioId={selectedPortfolioId}
        initialDateRange={dateRange}
      />

      <NewTradeDialog
        isOpen={isNewTradeOpen}
        onClose={() => setIsNewTradeOpen(false)}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
