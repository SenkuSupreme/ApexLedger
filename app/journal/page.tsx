"use client";

import { useState } from "react";
import Link from "next/link";
import TradeList from "@/components/TradeList";
import { 
  Plus, 
  BookOpen, 
  History, 
  TrendingUp, 
  Activity, 
  Database,
  Search,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="relative min-h-screen pb-20 font-sans text-white">
      {/* Institutional Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1200px] h-[1200px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-12 pt-12 space-y-12">
        {/* Header Mesh */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Trade Log Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-muted-foreground">
               <History size={10} className="text-blue-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Records: Active</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Journal
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Your complete trading history and performance records. Every entry helps you refine your strategy and improve your edge."
          </p>
        </div>

        <div className="flex items-center gap-4 relative">
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
            className="group relative flex items-center gap-4 bg-foreground text-background hover:bg-blue-500 hover:text-white px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">New Trade</span>
          </button>
        </div>
      </div>

      

      {/* Main Ledger Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative  bg-card/40 backdrop-blur-xl border border-border rounded-[3.5rem] p-8 shadow-3xl overflow-hidden group/ledger"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.02] blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/ledger:bg-blue-500/[0.05] transition-all duration-700" />
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-10 border-b border-border pb-8">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 <h2 className="text-xl font-black text-foreground italic uppercase tracking-tighter">Trade History</h2>
              </div>
              <div className="flex items-center gap-6">

              </div>
            </div>

            <div className="min-h-[500px]">
              <TradeList
                key={refreshKey}
                initialPortfolioId={selectedPortfolioId}
                initialDateRange={dateRange}
                onAddTrade={() => setIsNewTradeOpen(true)}
              />
            </div>
        </div>
      </motion.div>

      <NewTradeDialog
        isOpen={isNewTradeOpen}
        onClose={() => setIsNewTradeOpen(false)}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
      </div>
    </div>
  );
}
