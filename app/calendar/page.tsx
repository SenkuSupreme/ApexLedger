"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import TradingCalendar from "@/components/TradingCalendar";
import PortfolioSelector from "@/components/PortfolioSelector";
import { usePortfolios } from "@/context/PortfolioContext";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Globe,
  Database,
  Cpu,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  Zap,
  Flame,
  BarChart2,
  ChevronRight,
  Layout,
  Book,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachWeekOfInterval, 
  format, 
  parseISO,
  isSameMonth,
  isSameDay
} from "date-fns";
import Link from "next/link";
import { calculateTradeMetrics } from "@/lib/utils/tradeCalculations";

export default function CalendarPage() {
  const router = useRouter();
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolios();
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayTrades, setDayTrades] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date());

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

  const fetchDayDetails = async (date: string) => {
    if (!date) return;
    try {
      // Grouping in the backend is UTC-based (split('T')[0]).
      // To find trades for a specific YYYY-MM-DD grouping, we search 00:00:00 to 23:59:59 UTC.
      const startDateStr = `${date}T00:00:00.000Z`;
      const endDateStr = `${date}T23:59:59.999Z`;
      
      const params = new URLSearchParams({ 
        startDate: startDateStr, 
        endDate: endDateStr,
        limit: "100"
      });
      
      if (selectedPortfolioId && selectedPortfolioId !== "all") {
        params.append("portfolioId", selectedPortfolioId);
      }
      
      const res = await fetch(`/api/trades?${params}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error when fetching day details:", errorText);
        setDayTrades([]);
        return;
      }
      const data = await res.json();
      setDayTrades(data.trades || []);
    } catch (error) {
      console.error("Failed to parse day details JSON:", error);
      setDayTrades([]);
    }
  };

  const getCorrectPnL = (trade: any) => {
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
      } catch (e) {
        console.error("PnL Calc Error", e);
      }
    }
    return Number(trade.pnl) || 0;
  };

  useEffect(() => {
    fetchCalendarData(selectedPortfolioId);
  }, [selectedPortfolioId]);

  useEffect(() => {
    if (selectedDate) fetchDayDetails(selectedDate);
  }, [selectedDate, selectedPortfolioId]);

  const stats = useMemo(() => {
    const summary = calendarData.reduce(
      (acc: any, day: any) => {
        acc.totalTrades += day.trades || 0;
        acc.totalPnl += day.pnl || 0;
        if (day.pnl > 0) {
          acc.profitableDays++;
          acc.grossProfit += day.pnl;
        } else if (day.pnl < 0) {
          acc.grossLoss += Math.abs(day.pnl);
        }
        if (day.trades > 0) acc.activeDays++;
        return acc;
      },
      { totalTrades: 0, totalPnl: 0, profitableDays: 0, activeDays: 0, grossProfit: 0, grossLoss: 0 }
    );

    const profitFactor = summary.grossLoss > 0 ? (summary.grossProfit / summary.grossLoss).toFixed(2) : summary.grossProfit > 0 ? "∞" : "0.00";
    const avgDailyReturn = summary.activeDays > 0 ? (summary.totalPnl / summary.activeDays).toFixed(2) : "0.00";

    return { ...summary, profitFactor, avgDailyReturn };
  }, [calendarData]);

  const weeklyStats = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const weeks = eachWeekOfInterval({ start: startOfWeek(start), end: endOfWeek(end) })
      .filter(w => isSameMonth(w, viewDate) || isSameMonth(endOfWeek(w), viewDate));
    
    return weeks.map((weekStart, idx) => {
      const weekEnd = endOfWeek(weekStart);
      const displayStart = weekStart < start ? start : weekStart;
      const displayEnd = weekEnd > end ? end : weekEnd;
      const weekData = calendarData.filter(d => {
        const dDate = parseISO(d.date);
        return dDate >= displayStart && dDate <= displayEnd;
      });
      const weekPnl = weekData.reduce((sum: number, d: any) => sum + (d.pnl || 0), 0);
      const weekTrades = weekData.reduce((sum: number, d: any) => sum + (d.trades || 0), 0);
      return {
        label: `W${idx + 1}`,
        range: `${format(displayStart, "MMM d")} - ${format(displayEnd, "MMM d")}`,
        pnl: weekPnl,
        trades: weekTrades
      };
    });
  }, [calendarData, viewDate]);

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-sky-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 relative z-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CalendarIcon size={18} className="text-emerald-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Historical Ledger</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
            Trading <span className="text-emerald-400">Calendar</span>
          </h1>
          <p className="text-white/80 text-sm font-medium italic max-w-xl leading-relaxed">
            Analyze your daily performance patterns. Track consistency, risk management, and profitability streaks across the institutional calendar.
          </p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <PortfolioSelector
            currentId={selectedPortfolioId}
            onSelect={setSelectedPortfolioId}
          />
        </div>
      </div>

      {/* Monthly Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
        <StatCard label="Active Days" value={stats.activeDays} icon={<Activity size={14} />} color="emerald" />
        <StatCard label="Net Profit" value={`$${stats.totalPnl.toFixed(0)}`} icon={<TrendingUp size={14} />} color={stats.totalPnl >= 0 ? "emerald" : "rose"} />
        <StatCard label="Profit Factor" value={stats.profitFactor} icon={<Shield size={14} />} color="sky" />
        <StatCard label="Win Rate" value={`${stats.activeDays > 0 ? ((stats.profitableDays / stats.activeDays) * 100).toFixed(0) : 0}%`} icon={<Target size={14} />} color="emerald" />
        <StatCard label="Avg/Day" value={`$${stats.avgDailyReturn}`} icon={<BarChart2 size={14} />} color="purple" />
        <StatCard label="Total Trades" value={stats.totalTrades} icon={<Layers size={14} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Main Calendar View */}
        <div className="lg:col-span-8 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#050505]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-1 shadow-2xl overflow-hidden"
          >
             {loading ? (
               <div className="flex flex-col items-center justify-center h-[500px] gap-6 bg-black/40">
                 <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] animate-pulse">Synchronizing Ledger...</span>
               </div>
             ) : (
               <TradingCalendar 
                  data={calendarData} 
                  viewDate={viewDate}
                  onMonthChange={setViewDate}
                  onDateSelect={setSelectedDate} 
               />
             )}
          </motion.div>

          {/* Day Details View */}
          <AnimatePresence mode="wait">
             {selectedDate && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: "auto" }}
                 exit={{ opacity: 0, height: 0 }}
                 className="overflow-hidden"
               >
                 <div className="bg-[#050505]/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Day Overview</h3>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">{format(parseISO(selectedDate), "EEEE, MMMM do")}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedDate(null)}
                            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                        >
                            Close Day View
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayTrades.length > 0 ? (
                            dayTrades.map((trade: any) => (
                                <Link 
                                    key={trade._id} 
                                    href={`/journal/${trade._id}`}
                                    className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic ${trade.pnl >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                            {trade.symbol.slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white italic">{trade.symbol}</p>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{trade.direction} | {trade.assetType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black italic tracking-tighter ${getCorrectPnL(trade) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                            {getCorrectPnL(trade) >= 0 ? "+" : ""}${getCorrectPnL(trade).toFixed(2)}
                                        </p>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">View Details <ArrowRight size={8} className="inline ml-1" /></p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-2 py-10 text-center border border-dashed border-white/10 rounded-3xl">
                                <p className="text-[10px] font-black uppercase text-white/10 tracking-[0.3em] italic">No trade execution recorded for this period</p>
                            </div>
                        )}
                    </div>
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#050505]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 flex flex-col relative overflow-hidden group/sidebar shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
             
             <div className="flex items-center gap-4 mb-8 relative z-10">
               <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover/sidebar:bg-emerald-400 transition-all duration-500">
                 <Flame size={20} className="text-white/40 group-hover/sidebar:text-black transition-colors" />
               </div>
               <div>
                 <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic mb-1">Monthly Analytics</h3>
                 <p className="text-xl font-black text-white italic uppercase tracking-tighter shrink-0">{format(viewDate, "MMMM yyyy")}</p>
               </div>
             </div>

             <div className="space-y-3 relative z flex-1">
               {weeklyStats.map((week, idx) => (
                 <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] group/week transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-[10px] font-black text-white/30">
                            {week.label}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white italic uppercase tracking-wider">{week.range}</p>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{week.trades} Trades Executed</p>
                        </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-black italic tracking-tighter ${week.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {week.pnl >= 0 ? "+" : ""}${Math.abs(week.pnl).toFixed(0)}
                      </div>
                      <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] italic mt-1 group-hover/week:text-white/30 transition-colors">Net Yield</div>
                    </div>
                 </div>
               ))}
             </div>

             <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex gap-4">
                     <Shield size={20} className="text-emerald-400/50 shrink-0" />
                     <p className="text-[10px] font-medium text-white/40 italic leading-relaxed">
                       Institutional consistency tracking. Maintain a higher profitable internal percentage to optimize monthly yield.
                     </p>
                  </div>
             </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-4">
             <ShortcutCard href="/journal" label="Journal" icon={<Book size={16} />} />
             <ShortcutCard href="/strategies" label="Strategies" icon={<Layout size={16} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  const colors: any = {
    emerald: "text-emerald-400 group-hover:scale-110",
    rose: "text-rose-400 group-hover:scale-110",
    sky: "text-sky-400 group-hover:scale-110",
    purple: "text-purple-400 group-hover:scale-110",
    amber: "text-amber-400 group-hover:scale-110",
  };

  return (
    <div className="bg-[#050505]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 group hover:bg-white/[0.02] transition-all duration-500">
       <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-white/5 rounded-xl text-white/40 group-hover:text-white transition-colors">
             {icon}
          </div>
          <span className={`text-2xl font-black italic tracking-tighter transition-all duration-500 ${colors[color]}`}>{value}</span>
       </div>
       <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic leading-none group-hover:translate-x-1 transition-transform">
          {label}
       </div>
    </div>
  );
}

function ShortcutCard({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
        <div className="bg-[#050505]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
            <div className="flex flex-col gap-3">
                <div className="text-white/20 group-hover:text-white transition-colors">{icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">{label}</span>
            </div>
            <ChevronRight size={14} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
    </Link>
  );
}
