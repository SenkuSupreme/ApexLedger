"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { 
  BarChart2, 
  PlusCircle, 
  Globe, 
  Zap, 
  Activity, 
  TrendingUp, 
  Plus,
  Layout,
  Layers,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [focusedSection, setFocusedSection] = useState<string | null>(null);

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
      <div className="flex h-[80vh] w-full items-center justify-center text-muted-foreground font-bold text-sm uppercase tracking-wider animate-pulse">
        Loading...
      </div>
    );

  // Empty State View
  if (!portfoliosLoading && portfolios.length === 0) {
    return (
      <div className="min-h-screen space-y-12 text-foreground font-sans relative overflow-hidden px-4 md:px-8">
         {/* Background Mesh */}
         <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-secondary/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <div className="relative group text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
            <Layers size={64} className="text-muted-foreground/40 mx-auto mb-8 relative z-10" />
            <h1 className="text-5xl font-bold text-foreground mb-6 tracking-tight">
              Welcome to Your Dashboard
            </h1>
            <p className="text-foreground/80 text-base mb-12 max-w-md mx-auto leading-relaxed">
              Create your first trading portfolio to begin tracking your performance, journaling trades, and analyzing your metrics.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative flex items-center gap-3 bg-foreground text-background hover:bg-primary hover:text-primary-foreground px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 mx-auto overflow-hidden"
            >
              <PlusCircle size={18} />
              <span>Create Portfolio</span>
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
    <div className="space-y-6 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-6 bg-background">
      {/* Background Mesh - Enhanced Visibility */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.02] blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/[0.02] blur-[120px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_80%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 relative z-10 gap-4 pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Dashboard Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-foreground/60">
               <Globe size={10} />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Market Live</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
             Dashboard
          </h1>
          <p className="text-foreground/80 text-xs md:text-sm font-medium italic max-w-lg leading-relaxed">
            "Your trading overview and active market monitoring. Track your performance and stay focused on your goals."
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
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
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground px-8 py-3.5 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={16} className="relative z-10" />
            <span className="relative z-10">New Portfolio</span>
          </button>
        </div>
      </div>

      {/* Progress Overlay */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 z-30">
          <div className="h-full bg-primary animate-progress origin-left shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
        </div>
      )}

      {/* Main Analysis Section */}
      <div className="space-y-8 relative z-0">
        
        {/* Row 1: Sessions & Quick Notes (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Market Sessions (2/3 Width) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 h-[550px] relative bg-card border border-border rounded-[2rem] shadow-2xl overflow-visible p-1 z-10"
          >
            <ForexSessionNavbar />
          </motion.div>

          {/* Quick Notes (1/3 Width) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 h-[550px] relative z-10 bg-card border border-border rounded-[2rem] p-6 overflow-hidden group shadow-2xl flex flex-col"
          >

            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">Notes</span>
                  </div>
                  <h3 className="text-lg font-black text-foreground italic tracking-tighter uppercase opacity-100">Quick Notes</h3>
                </div>
                <div className="p-2 bg-foreground/5 rounded-xl border border-border text-yellow-500">
                   <Zap size={16} />
                </div>
              </div>
              
              <div className={`flex-1 overflow-hidden transition-opacity duration-500 ${loading ? "opacity-50" : ""}`}>
                <QuickNotesWidget />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Widget System (Full Width) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative z-10 transition-all duration-500 ${loading ? "opacity-50" : ""}`}
        >
          <div className="flex items-center gap-4 mb-8">
             <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
             <div className="flex items-center gap-3 px-6 py-2 bg-card/60 backdrop-blur-md border border-border rounded-full shadow-lg">
                <Layout size={14} className="text-foreground/80" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Performance Stats</span>
             </div>
             <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          </div>
          
          <div className="w-full">
            <WidgetSystem stats={stats} loading={loading} />
          </div>
        </motion.div>
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
