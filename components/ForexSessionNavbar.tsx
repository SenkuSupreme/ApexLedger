"use client";

import React, { useState, useEffect } from "react";

// Session definitions relative to a 24h cycle starting at 03:45 NPT (Sydney Open)
// All offsets and durations in minutes
const CYCLE_START_TIME = { hour: 3, minute: 45 }; // 03:45 AM
const TOTAL_MINUTES = 24 * 60;

// Session definitions with timezone information
const SESSIONS = [
  {
    id: "sydney",
    name: "Sydney",
    startOffset: 0,
    duration: 540,
    color: "bg-blue-500",
    localLabel: "03:45 - 12:45",
    timezone: "Australia/Sydney",
    details:
      "Lower volatility. Good for AUD, NZD pairs. Market liquidity forms.",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    startOffset: 120,
    duration: 540,
    color: "bg-indigo-500",
    localLabel: "05:45 - 14:45",
    timezone: "Asia/Tokyo",
    details:
      "Moderate volatility. Best pairs: JPY (USDJPY, EURJPY). Range-bound unless news.",
  },
  {
    id: "london",
    name: "London",
    startOffset: 600,
    duration: 540,
    color: "bg-orange-500",
    localLabel: "13:45 - 22:45",
    timezone: "Europe/London",
    details:
      "Highest liquidity. Strong directional moves. Best: EURUSD, GBPUSD, XAUUSD.",
  },
  {
    id: "newyork",
    name: "New York",
    startOffset: 900,
    duration: 540,
    color: "bg-emerald-500",
    localLabel: "18:45 - 03:45",
    timezone: "America/New_York",
    details:
      "High volatility. USD pairs dominate. Major US economic news releases.",
  },
];

const ForexSessionNavbar = React.memo(function ForexSessionNavbar() {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("");
  const [activeSessions, setActiveSessions] = useState<string[]>([]);
  const [sessionTimes, setSessionTimes] = useState<{ [key: string]: string }>(
    {}
  );

  // Helper function to format time for a specific timezone
  const getTimeInTimezone = (timezone: string) => {
    const now = new Date();
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const nptOffset = 5.75 * 60 * 60 * 1000; // +5:45
      const nptDate = new Date(utcTime + nptOffset);

      const currentHours = nptDate.getHours();
      const currentMinutes = nptDate.getMinutes();
      const currentTotalMins = currentHours * 60 + currentMinutes;

      // Calculate progress relative to 03:45 AM
      const startMins = CYCLE_START_TIME.hour * 60 + CYCLE_START_TIME.minute;
      let diffMins = currentTotalMins - startMins;
      if (diffMins < 0) diffMins += TOTAL_MINUTES;

      const progress = (diffMins / TOTAL_MINUTES) * 100;
      setCurrentProgress(progress);

      const hours = nptDate.getHours();
      const minutes = nptDate.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

      setCurrentTimeFormatted(`${displayHours}:${displayMinutes} ${ampm}`);

      // Update session times
      const times: { [key: string]: string } = {};
      SESSIONS.forEach((session) => {
        times[session.id] = getTimeInTimezone(session.timezone);
      });
      setSessionTimes(times);

      // Determine active sessions
      const active = SESSIONS.filter((session) => {
        return (
          diffMins >= session.startOffset &&
          diffMins < session.startOffset + session.duration
        );
      }).map((s) => s.id);

      setActiveSessions(active);
    };

    updateTime();
    // Update every 10 seconds for performance
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex justify-between items-end mb-4 relative ">
        <div>
          <h2 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">
            Global Market Sessions
          </h2>
          <div className="text-4xl font-black text-foreground font-mono tracking-tight">
            {currentTimeFormatted} <span className="text-xs font-bold text-muted-foreground/60 ml-3 uppercase tracking-widest">Local (NPT)</span>
          </div>
        </div>
        <div className="flex gap-3 relative ">
          {SESSIONS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                activeSessions.includes(s.id) 
                  ? "bg-foreground/10 border-foreground/20 text-foreground shadow-lg backdrop-blur-md" 
                  : "bg-foreground/[0.02] border-border text-muted-foreground/30"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${s.color} ${activeSessions.includes(s.id) ? "animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-40"}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative flex-1 w-full min-h-[0] flex flex-col justify-center">
        {/* Horizontal Divider Line */}
        <div className="absolute top-0 bottom-0 left-0 w-full bg-[linear-gradient(90deg,transparent_0%,hsl(var(--foreground)/0.02)_50%,transparent_100%)] pointer-events-none" />
        
        {/* Time Grid - Subtle */}
        <div className="absolute inset-x-0 top-0 bottom-8 flex justify-between px-[1px] pointer-events-none z-0">
           {[0, 6, 12, 18, 24].map((h) => (
             <div key={h} className="h-full w-px border-l border-dashed border-border opacity-50">
               <span className="absolute bottom-[-24px] -translate-x-1/2 text-[10px] font-mono text-muted-foreground/60">{h.toString().padStart(2, '0')}:00</span>
             </div>
           ))}
        </div>

        {/* Session Bars */}
        <div className="relative w-full h-[200px]">
          {SESSIONS.map((session, index) => {
            const left = (session.startOffset / TOTAL_MINUTES) * 100;
            const width = (session.duration / TOTAL_MINUTES) * 100;
            const top = index * 45 + 10; // Spacing

            return (
              <div
                key={session.id}
                className={`absolute h-9 rounded-lg flex items-center px-3 border transition-all duration-300 group cursor-help hover:z-50 ${
                  activeSessions.includes(session.id)
                    ? "bg-foreground/10 border-foreground/20"
                    : "bg-foreground/[0.03] border-border"
                }`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  top: `${top}px`,
                }}
              >
                {/* Active Indicator Color Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${session.color} ${activeSessions.includes(session.id) ? "opacity-100" : "opacity-30"}`} />

                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ml-2 transition-colors ${
                    activeSessions.includes(session.id) ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {session.name}
                </span>

                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 z-[60] hidden group-hover:block min-w-[200px] p-4 bg-card border border-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                     <span className="text-xs font-bold text-foreground uppercase">{session.name}</span>
                     <span className="text-[10px] font-mono text-muted-foreground/50">{sessionTimes[session.id]} (Local)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed min-w-[180px]">
                    {session.details}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Current Time Line - Interactive */}
          <div
            className="absolute -top-4 -bottom-4 w-[3px] z-[60] group cursor-help transition-all duration-1000 ease-linear"
            style={{ left: `${currentProgress}%` }}
          >
             {/* Visual Line */}
             <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
             
             {/* Top Node */}
             <div className="absolute top-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)] z-10" />
             
             {/* Bottom Node */}
             <div className="absolute bottom-0 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full z-10" />
             
             {/* Badge */}
             <div className="absolute top-4 left-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-bold text-red-400 whitespace-nowrap backdrop-blur-sm opacity-50 group-hover:opacity-100 transition-opacity">
                Current Time
             </div>

             {/* Hover Hit Area (Invisible but wider) */}
             <div className="absolute inset-y-0 -left-2 -right-2 bg-transparent" />

             {/* Detailed Time Tooltip */}
             <div className="absolute top-8 left-4 z-[70] hidden group-hover:block w-72 p-4 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                <div className="text-sm font-bold text-foreground mb-3 pb-2 border-b border-border flex justify-between items-center">
                  <span>Current Status</span>
                  <span className="text-[10px] font-mono text-red-400">LIVE</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-foreground/[0.03] p-2 rounded-lg">
                    <span className="text-xs text-muted-foreground/60">Your Time (NPT)</span>
                    <span className="text-xs text-foreground font-mono font-bold tracking-tight">
                      {currentTimeFormatted}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {SESSIONS.map((session) => (
                      <div
                        key={session.id}
                        className={`flex justify-between items-center px-2 py-1 rounded ${activeSessions.includes(session.id) ? "bg-foreground/[0.05]" : "opacity-40"}`}
                      >
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${session.color}`} />
                           <span className="text-[10px] text-foreground/80 uppercase">{session.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 font-mono">
                          {sessionTimes[session.id] || "--:--"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ForexSessionNavbar;