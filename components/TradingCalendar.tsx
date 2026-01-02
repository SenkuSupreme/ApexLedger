"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarDay {
  date: string;
  trades: number;
  pnl: number;
  emotion?: string;
  isToday?: boolean;
  isCurrentMonth?: boolean;
}

interface TradingCalendarProps {
  data?: CalendarDay[];
  viewDate: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect?: (date: string) => void;
}

export default function TradingCalendar({
  data = [],
  viewDate,
  onMonthChange,
  onDateSelect,
}: TradingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Prev month days
    for (let i = 0; i < startingDayOfWeek; i++) {
        const prevDate = new Date(year, month, 0);
        const dayNum = prevDate.getDate() - startingDayOfWeek + i + 1;
        const actualDate = new Date(year, month - 1, dayNum);
        days.push({
            date: actualDate.toISOString().split("T")[0],
            trades: 0,
            pnl: 0,
            isCurrentMonth: false,
        });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dateStr = dayDate.toISOString().split("T")[0];
      const dayData = data.find((d) => d.date === dateStr);
      const today = new Date();

      days.push({
        date: dateStr,
        trades: dayData?.trades || 0,
        pnl: dayData?.pnl || 0,
        emotion: dayData?.emotion,
        isToday: dateStr === today.toISOString().split("T")[0],
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate.toISOString().split("T")[0],
        trades: 0,
        pnl: 0,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const navigateMonth = (dir: "prev" | "next") => {
    setDirection(dir === "next" ? 1 : -1);
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + (dir === "next" ? 1 : -1), 1);
    onMonthChange(newDate);
  };

  const getPnlIntensity = (pnl: number, trades: number, isSelected: boolean) => {
    if (trades === 0) return isSelected ? "bg-white/[0.08] border-white/20" : "bg-white/[0.01] border-white/5";
    if (pnl > 0) {
      if (pnl > 1000) return "bg-emerald-400 text-black shadow-[0_0_30px_rgba(52,211,153,0.3)] border-transparent font-black";
      if (pnl > 500) return "bg-emerald-500/80 text-white border-white/10";
      return "bg-emerald-600/40 text-emerald-400 border-emerald-500/20";
    } else if (pnl < 0) {
      if (pnl < -1000) return "bg-rose-400 text-black shadow-[0_0_30px_rgba(251,113,113,0.3)] border-transparent font-black";
      if (pnl < -500) return "bg-rose-500/80 text-white border-white/10";
      return "bg-rose-600/40 text-rose-400 border-rose-500/20";
    }
    return "bg-sky-500/20 text-sky-400 border-sky-500/20";
  };

  const handleDateClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    const newDate = selectedDate === day.date ? null : day.date;
    setSelectedDate(newDate);
    onDateSelect?.(newDate || "");
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div className="bg-[#050505] p-6 md:p-10 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 relative z-10 gap-6">
        <div>
          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
              <CalendarIcon size={22} className="text-white/40" />
            </div>
            Monthly <span className="text-white/40">Performance</span>
          </h3>
          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.6em] mt-3 pl-1">
            Institutional Ledger Tracking System
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.03] p-2 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl">
          <button 
            onClick={() => navigateMonth("prev")} 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all active:scale-90 text-white/40 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="px-8 flex flex-col items-center min-w-[180px]">
            <span className="text-xs font-black text-white italic uppercase tracking-[0.2em]">
                {monthNames[viewDate.getMonth()]}
            </span>
            <span className="text-[9px] font-black text-white/20 tracking-[0.4em] uppercase mt-0.5">
                {viewDate.getFullYear()}
            </span>
          </div>

          <button 
            onClick={() => navigateMonth("next")} 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all active:scale-90 text-white/40 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-3 mb-4 relative z-10">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, i) => (
          <div key={i} className={`text-center text-[10px] font-black tracking-[0.3em] ${i === 0 || i === 6 ? 'text-white/10' : 'text-white/20'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewDate.toISOString()}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-7 gap-3"
          >
            {days.map((day, i) => {
              const dayNum = new Date(day.date).getDate();
              const isSelected = selectedDate === day.date;
              const intensity = getPnlIntensity(day.pnl, day.trades, isSelected);
              
              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    relative aspect-square p-3 md:p-5 rounded-3xl transition-all duration-500
                    flex flex-col justify-between border group/tile
                    ${day.isCurrentMonth ? "cursor-pointer hover:shadow-2xl hover:-translate-y-1" : "opacity-0 pointer-events-none"}
                    ${isSelected ? "ring-2 ring-white/40 scale-105 z-20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]" : ""}
                    ${intensity}
                  `}
                >
                  <div className="w-full flex justify-between items-start">
                    <span className={`text-xs md:text-sm font-black tracking-tighter ${day.isToday ? 'bg-white text-black px-1.5 rounded-md' : ''}`}>
                        {dayNum}
                    </span>
                    {day.trades > 0 && (
                      <div className="flex flex-col items-end opacity-40 group-hover/tile:opacity-100 transition-opacity">
                        <span className="text-[8px] md:text-[10px] font-black tracking-tighter leading-none italic">{day.trades}T</span>
                      </div>
                    )}
                  </div>

                  {day.trades > 0 && (
                    <div className="mt-auto space-y-1 md:space-y-2">
                      <div className="text-[10px] md:text-base font-black italic tracking-tighter leading-none truncate">
                        {day.pnl >= 0 ? '+' : '-'}${Math.abs(day.pnl).toFixed(0)}
                      </div>
                      <div className="h-0.5 md:h-1 w-full bg-black/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((Math.abs(day.pnl) / 1500) * 100, 100)}%` }}
                          className="h-full bg-white/40"
                        />
                      </div>
                    </div>
                  )}
                  
                  {isSelected && (
                    <motion.div 
                        layoutId="selection-glow"
                        className="absolute inset-0 bg-white/10 rounded-3xl blur-xl -z-10"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8">
        <div className="flex items-center gap-6">
            <LegendItem color="bg-emerald-400" label="Surplus" />
            <LegendItem color="bg-rose-400" label="Deficit" />
            <LegendItem color="bg-white/5" label="Inactive" />
        </div>
        
        <div className="flex items-center gap-3 py-2 px-4 bg-white/5 rounded-2xl border border-white/10">
            <Info size={14} className="text-white/40" />
            <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em]">Select a ledger entry for deep-dive day analytics</span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em] italic">{label}</span>
        </div>
    );
}
