"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

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
  onDateSelect?: (date: string) => void;
}

export default function TradingCalendar({
  data = [],
  onDateSelect,
}: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevDate.toISOString().split("T")[0],
        trades: 0,
        pnl: 0,
        isCurrentMonth: false,
      });
    }

    // Add days of the current month
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

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev: any) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPnlIntensity = (pnl: number, trades: number) => {
    if (trades === 0) return "bg-white/5";

    if (pnl > 0) {
      if (pnl > 1000) return "bg-green-500/80";
      if (pnl > 500) return "bg-green-500/60";
      if (pnl > 100) return "bg-green-500/40";
      return "bg-green-500/20";
    } else if (pnl < 0) {
      if (pnl < -1000) return "bg-red-500/80";
      if (pnl < -500) return "bg-red-500/60";
      if (pnl < -100) return "bg-red-500/40";
      return "bg-red-500/20";
    }

    return "bg-white/10";
  };

  const handleDateClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;

    setSelectedDate(day.date);
    onDateSelect?.(day.date);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} />
            Trading Calendar
          </h3>
          <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
            Performance Overview
          </p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft size={16} className="text-white/60" />
        </button>

        <h4 className="text-white font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>

        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight size={16} className="text-white/60" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs text-white/60 font-mono p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => handleDateClick(day)}
            className={`
              relative aspect-square p-1 rounded-lg transition-all hover:scale-105
              ${
                day.isCurrentMonth
                  ? "cursor-pointer"
                  : "cursor-default opacity-30"
              }
              ${day.isToday ? "ring-2 ring-white/40" : ""}
              ${selectedDate === day.date ? "ring-2 ring-blue-500" : ""}
              ${getPnlIntensity(day.pnl, day.trades)}
            `}
            disabled={!day.isCurrentMonth}
            title={
              day.isCurrentMonth
                ? `${day.date}: ${day.trades} trades, $${day.pnl.toFixed(
                    0
                  )} P&L`
                : ""
            }
          >
            <div className="text-xs text-white font-medium">
              {new Date(day.date).getDate()}
            </div>

            {day.trades > 0 && day.isCurrentMonth && (
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white/80 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500/40 rounded" />
            <span className="text-white/60">Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/10 rounded" />
            <span className="text-white/60">No Trades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/40 rounded" />
            <span className="text-white/60">Profit</span>
          </div>
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-sm text-white font-medium mb-1">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          {(() => {
            const dayData = data.find((d) => d.date === selectedDate);
            if (dayData && dayData.trades > 0) {
              return (
                <div className="space-y-1">
                  <div className="text-xs text-white/60">
                    {dayData.trades} trade{dayData.trades !== 1 ? "s" : ""}
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      dayData.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {dayData.pnl >= 0 ? "+" : ""}${dayData.pnl.toFixed(2)}
                  </div>
                  {dayData.emotion && (
                    <div className="text-xs text-white/60 capitalize">
                      Emotion: {dayData.emotion}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div className="text-xs text-white/60">No trades recorded</div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
