"use client";

import React, { useState, useEffect } from "react";
import { Globe, Clock, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";

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
    { name: "Sydney", open: 22, close: 7, color: "#3b82f6" },
    { name: "Tokyo", open: 0, close: 9, color: "#ef4444" },
    { name: "London", open: 7, close: 16, color: "#10b981" },
    { name: "New York", open: 13, close: 20, color: "#f59e0b" },
  ];

  const utcHour = currentTime.getUTCHours() + currentTime.getUTCMinutes() / 60;

  const isSessionActive = (open: number, close: number) => {
    const hour = currentTime.getUTCHours();
    if (open < close) return hour >= open && hour < close;
    return hour >= open || hour < close;
  };

  const formatLocalTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={`h-full relative overflow-hidden group/sessions ${className}`}>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none group-hover/sessions:bg-blue-500/10 transition-colors duration-700" />

      {/* Header - Unified Single Line */}
      <div className="relative z-10 flex items-center gap-3 mb-10 pb-8 border-b border-white/[0.03] whitespace-nowrap overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping opacity-20" />
          </div>
          
        </div>
        
        <div className="flex items-baseline gap-2 ml-auto shrink-0">
          <span className="text-lg font-black text-foreground italic tabular-nums leading-none tracking-tighter">
            {formatLocalTime()}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/20">
            Local (NPT)
          </span>
        </div>
      </div>

      {/* Session Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {sessions.map((session, idx) => {
          const active = isSessionActive(session.open, session.close);
          return (
            <motion.div
              key={session.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-4 rounded-[1.5rem] bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-300 group/session"
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full transition-all duration-500" 
                  style={{ 
                    backgroundColor: session.color,
                    boxShadow: active ? `0 0 10px ${session.color}` : 'none',
                    opacity: active ? 1 : 0.2
                  }} 
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover/session:text-foreground/60 transition-colors">
                  {session.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black italic tracking-tight ${active ? 'text-foreground' : 'text-foreground/20'}`}>
                  {active ? 'ACTIVE' : 'IDLE'}
                </span>
                {active && (
                  <Activity size={12} className="text-foreground/40 animate-pulse" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 24-Hour Timeline */}
      <div className="relative mt-auto pt-6 border-t border-white/[0.03]">
        <div className="relative h-14 w-full bg-white/[0.01] rounded-2xl overflow-hidden border border-white/[0.03]">
          {/* Hour Grid Lines */}
          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.03]">
            {[0, 6, 12, 18, 24].map((h) => (
              <div key={h} className="w-[1px] h-full bg-white" />
            ))}
          </div>

          {/* Session Bars */}
          <div className="absolute inset-0 py-2.5 space-y-1.5">
            {sessions.map((session) => {
              const start = (session.open / 24) * 100;
              const end = (session.close / 24) * 100;
              const isActive = isSessionActive(session.open, session.close);
              
              if (session.open > session.close) {
                return (
                  <React.Fragment key={session.name}>
                    <div 
                      className="absolute h-[5px] rounded-full transition-all duration-700"
                      style={{ 
                        left: `${start}%`, 
                        right: '0%', 
                        backgroundColor: session.color,
                        opacity: isActive ? 0.7 : 0.08,
                        boxShadow: isActive ? `0 0 15px ${session.color}66` : 'none'
                      }}
                    />
                    <div 
                      className="absolute h-[5px] rounded-full transition-all duration-700"
                      style={{ 
                        left: '0%', 
                        width: `${end}%`, 
                        backgroundColor: session.color,
                        opacity: isActive ? 0.7 : 0.08,
                        boxShadow: isActive ? `0 0 15px ${session.color}66` : 'none'
                      }}
                    />
                  </React.Fragment>
                );
              }
              
              return (
                <div 
                  key={session.name}
                  className="absolute h-[5px] rounded-full transition-all duration-700"
                  style={{ 
                    left: `${start}%`, 
                    width: `${end - start}%`, 
                    backgroundColor: session.color,
                    opacity: isActive ? 0.7 : 0.08,
                    boxShadow: isActive ? `0 0 15px ${session.color}66` : 'none'
                  }}
                />
              );
            })}
          </div>

          {/* Current Time Indicator Line */}
          <motion.div 
            className="absolute top-0 bottom-0 w-[2px] bg-white z-20 shadow-[0_0_20px_white]"
            style={{ left: `${(utcHour / 24) * 100}%` }}
            animate={{ left: `${(utcHour / 24) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 shadow-[0_0_10px_white]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 shadow-[0_0_10px_white]" />
          </motion.div>
        </div>
        
        {/* Time Labels - Explicit Markers */}
        <div className="flex justify-between mt-3 px-1 text-[9px] font-black text-foreground/20 italic tracking-widest tabular-nums uppercase">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-5">
            {sessions.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color, opacity: isSessionActive(s.open, s.close) ? 1 : 0.2 }} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isSessionActive(s.open, s.close) ? 'text-foreground/40' : 'text-foreground/15'}`}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-foreground/10" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/10 italic">Neural Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

