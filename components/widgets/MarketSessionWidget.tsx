"use client";

import React, { useState, useEffect } from "react";
import { Globe, Clock } from "lucide-react";

interface MarketSessionWidgetProps {
  className?: string;
}

export default function MarketSessionWidget({
  className = "",
}: MarketSessionWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sessions = [
    {
      name: "Sydney",
      timezone: "Australia/Sydney",
      open: 22, // 10 PM UTC
      close: 7, // 7 AM UTC
      color: "bg-blue-500",
    },
    {
      name: "Tokyo",
      timezone: "Asia/Tokyo",
      open: 0, // 12 AM UTC
      close: 9, // 9 AM UTC
      color: "bg-red-500",
    },
    {
      name: "London",
      timezone: "Europe/London",
      open: 8, // 8 AM UTC
      close: 17, // 5 PM UTC
      color: "bg-green-500",
    },
    {
      name: "New York",
      timezone: "America/New_York",
      open: 13, // 1 PM UTC
      close: 22, // 10 PM UTC
      color: "bg-yellow-500",
    },
  ];

  const isSessionActive = (open: number, close: number) => {
    const utcHour = currentTime.getUTCHours();
    if (open < close) {
      return utcHour >= open && utcHour < close;
    } else {
      return utcHour >= open || utcHour < close;
    }
  };

  const getSessionTime = (timezone: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(currentTime);
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Market Sessions</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            Live Trading Hours
          </p>
        </div>
        <Globe size={20} className="text-white/60" />
      </div>

      <div className="space-y-3">
        {sessions.map((session, index) => {
          const isActive = isSessionActive(session.open, session.close);
          const sessionTime = getSessionTime(session.timezone);

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-white/10 border-white/20"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${session.color} ${
                      isActive ? "animate-pulse" : "opacity-50"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {session.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {isActive ? "ACTIVE" : "CLOSED"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white">
                    {sessionTime}
                  </div>
                  <div className="text-xs text-white/60">
                    {session.open}:00-{session.close}:00 UTC
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
