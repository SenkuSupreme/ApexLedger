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
    <div className="w-full bg-[#0A0A0A] rounded-xl border border-white/10 p-6 h-[400px] flex flex-col">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Header / Info */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-lg font-bold text-white/60 uppercase tracking-widest">
              Market Sessions (NPT)
            </h2>
            <div className="text-4xl font-bold text-white font-mono mt-2">
              {currentTimeFormatted}
            </div>
          </div>
          <div className="flex gap-6 text-sm font-mono text-white/40">
            {SESSIONS.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 ${
                  activeSessions.includes(s.id) ? "text-white" : "opacity-40"
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${s.color}`} />
                <span className="text-sm">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative flex-1 w-full min-h-[240px]">
          <div className="absolute top-0 left-0 w-full h-full border-t border-b border-white/5" />

          {/* Session Bars */}
          <div className="absolute top-8 left-0 w-full h-[180px]">
            {SESSIONS.map((session, index) => {
              const left = (session.startOffset / TOTAL_MINUTES) * 100;
              const width = (session.duration / TOTAL_MINUTES) * 100;
              const top = index * 40;

              return (
                <div
                  key={session.id}
                  className="absolute h-8 rounded-lg flex items-center px-3 border border-white/5 transition-opacity group cursor-help"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${top}px`,
                    backgroundColor: activeSessions.includes(session.id)
                      ? "rgb(255 255 255 / 0.1)"
                      : "rgb(255 255 255 / 0.03)",
                    borderColor: activeSessions.includes(session.id)
                      ? "rgb(255 255 255 / 0.2)"
                      : "transparent",
                  }}
                >
                  <span
                    className={`text-sm uppercase font-bold tracking-wider mr-3 ${session.color.replace(
                      "bg-",
                      "text-"
                    )}`}
                  >
                    {session.name}
                  </span>
                  <span className="text-xs text-white/40 font-mono hidden md:inline ml-auto">
                    {session.localLabel}
                  </span>

                  <div className="absolute top-10 left-0 z-50 hidden group-hover:block w-56 p-3 bg-[#111] border border-white/10 rounded-lg shadow-xl">
                    <p className="text-xs text-white/80 leading-relaxed">
                      {session.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Time Line with Hover Tooltip */}
          <div
            className="absolute top-0 bottom-0 w-[3px] bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] z-20 transition-all duration-1000 ease-linear group cursor-help"
            style={{ left: `${currentProgress}%` }}
          >
            <div className="absolute -top-2 -left-[6px] w-4 h-4 bg-red-500 rounded-full" />
            <div className="absolute -bottom-2 -left-[6px] w-4 h-4 bg-red-500 rounded-full" />

            {/* Time Tooltip */}
            <div className="absolute top-[-15px] left-[-140px] z-50 hidden group-hover:block w-72 p-4 bg-[#111] border border-white/10 rounded-lg shadow-xl">
              <div className="text-sm font-bold text-white mb-3 text-center">
                Current Time
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">NPT (Local):</span>
                  <span className="text-sm text-white font-mono">
                    {currentTimeFormatted}
                  </span>
                </div>
                {SESSIONS.map((session) => (
                  <div
                    key={session.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-white/60">
                      {session.name}:
                    </span>
                    <span className="text-sm text-white font-mono">
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
  );
});

export default ForexSessionNavbar;
