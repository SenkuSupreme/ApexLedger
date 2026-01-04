"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Book,
  BookOpen,
  TrendingUp,
  Layers,
  BarChart3,
  Newspaper,
  Microscope,
  Timer,
  Trophy,
  CheckSquare,
  Target,
  Activity,
  Notebook,
  Calculator,
  ChevronLeft,
  Calendar,
  StickyNote,
  MessageCircle,
  Eye,
  Clock,
  Zap,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

const navGroups = [
  {
    label: "Analytics",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/journal", icon: Book, label: "Journal" },
      { href: "/calendar", icon: Calendar, label: "Calendar" },
    ],
  },
  {
    label: "Performance",
    items: [
      { href: "/bias", icon: Eye, label: "Bias" },
      { href: "/sessions", icon: Timer, label: "Sessions" },
      { href: "/strategy", icon: Layers, label: "Strategy" },
      { href: "/market-environment", icon: Microscope, label: "Market Env" },
      { href: "/execution-architecture", icon: Activity, label: "Exec Arch" },
      // { href: "/active-sessions", icon: Clock, label: "Active Sessions" },
      { href: "/signal-trigger", icon: Zap, label: "Signal Trigger" },
      { href: "/technical-confluence", icon: BarChart3, label: "Tech Confluence" },
    ],
  },
  // {
  //   label: "Community",
  //   items: [
  //     { href: "/leaderboard", icon: Trophy, label: "Community" },
  //     { href: "/chat", icon: MessageCircle, label: "Chat" },
  //   ],
  // },
  {
    label: "Strategy",
    items: [
      { href: "/strategies", icon: Layers, label: "Strategies" },
      { href: "/checklists", icon: CheckSquare, label: "Checklists" },
      // { href: "/backtester", icon: TrendingUp, label: "Backtester" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/chart", icon: BarChart3, label: "Chart" },
      { href: "/news", icon: Newspaper, label: "News" },
      { href: "/research", icon: Microscope, label: "Research" },
      { href: "/calculator", icon: Calculator, label: "Calculator" },
    ],
  },
  {
    label: "Productivity",
    items: [
      { href: "/tasks", icon: CheckSquare, label: "Tasks" },
      { href: "/goals", icon: Target, label: "Goals" },
      { href: "/habits", icon: Activity, label: "Habits" },
      { href: "/notebook", icon: Notebook, label: "Notebook" },
      { href: "/notes-detailed", icon: BookOpen, label: "Notes (detailed)" },
      { href: "/activity-log", icon: StickyNote, label: "Activity Log" },
    ],
  },
];

const Sidebar = React.memo(function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Analytics", "Performance"]);
  const [hoveredItem, setHoveredItem] = useState<{ label: string; y: number } | null>(null);

  const [groups, setGroups] = useState(navGroups);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const handleItemHover = useCallback((label: string | null, y: number = 0) => {
    if (label) {
      setHoveredItem({ label, y });
    } else {
      setHoveredItem(null);
    }
  }, []);

  const handleItemReorder = (groupLabel: string, newItems: any[]) => {
    setGroups(prev => prev.map(g => 
      g.label === groupLabel ? { ...g, items: newItems } : g
    ));
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 250 }}
      className="fixed left-0 top-0 h-full bg-[#050505]/95 backdrop-blur-3xl border-r border-white/5 z-40 flex flex-col transition-all duration-300 ease-in-out shadow-[30px_0_60px_rgba(0,0,0,0.8)]"
    >
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Logo Section */}
      <div className="h-24 flex items-center px-6 border-b border-white/5 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
        <div className="flex items-center justify-center w-full relative z-10 transition-all duration-300">
        <div className="flex items-center justify-center w-full relative z-10 transition-all duration-300">
          {!isCollapsed ? (
            <div className="flex flex-col items-center">
              <span className="font-black text-2xl tracking-tighter text-white italic leading-none">
                APEX<span className="text-white/40">LEDGER</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mt-1.5">Elite Terminal Core</span>
            </div>
          ) : (
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
               <TrendingUp size={20} className="text-black" strokeWidth={3} />
             </div>
          )}
        </div>
        </div>

      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-28 w-6 h-12 bg-[#0a0a0a] border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[#151515] transition-all z-[100] group hover:scale-110 shadow-[5px_0_20px_rgba(0,0,0,0.9)]"
      >
        <ChevronLeft
          size={12}
          strokeWidth={4}
          className={`transition-transform duration-500 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-8 px-3 space-y-4 relative z-10">
        <Reorder.Group axis="y" as="div" values={groups} onReorder={setGroups} className="space-y-4">
          {groups.map((group) => {
            const isExpanded = expandedGroups.includes(group.label);
            return (
              <Reorder.Item key={group.label} as="div" value={group} className="space-y-1.5 cursor-grab active:cursor-grabbing">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-black text-white/90 uppercase tracking-[0.4em] hover:text-white transition-all group select-none cursor-grab active:cursor-grabbing"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{group.label}</span>
                    <ChevronDown 
                      size={10} 
                      className={`transition-transform duration-300 ${isExpanded ? "" : "-rotate-90"} opacity-30 group-hover:opacity-100`} 
                    />
                  </button>
                )}
                
                <AnimatePresence initial={false}>
                  {(isExpanded || isCollapsed) && (
                    <motion.div
                      initial={isCollapsed ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                       <Reorder.Group 
                          axis="y" 
                          as="div"
                          values={group.items} 
                          onReorder={(newItems) => handleItemReorder(group.label, newItems)}
                          className="space-y-1"
                       >
                          {group.items.map((item) => (
                            <Reorder.Item key={item.href} as="div" value={item}>
                              <NavItem
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={pathname === item.href}
                                isCollapsed={isCollapsed}
                                onHover={handleItemHover}
                              />
                            </Reorder.Item>
                          ))}
                       </Reorder.Group>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!isCollapsed && <div className="h-4" />}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {/* External Tooltip (Floating) */}
      <AnimatePresence>
        {isCollapsed && hoveredItem && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{ top: hoveredItem.y }}
            className="fixed left-[85px] pointer-events-none z-50"
          >
            <div className="bg-[#0a0a0a] border border-white/10 px-4 py-3 rounded-2xl shadow-[15px_15px_40px_rgba(0,0,0,0.9)] flex items-center gap-3 whitespace-nowrap min-w-[140px] border-l-white/20 backdrop-blur-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white leading-none italic">
                {hoveredItem.label}
              </span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[#0a0a0a] mr-[-1px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
});

function NavItem({ href, icon: Icon, label, active, isCollapsed, onHover }: any) {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (isCollapsed && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      onHover(label, rect.top + rect.height / 2 - 20); // Center the tooltip relative to the item
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      onHover(null);
    }
  };

  return (
    <Link 
      href={href} 
      className="block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={itemRef}
        className={`
                relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group
                ${
                  active
                    ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] scale-[1.02] z-10"
                    : "text-white hover:bg-white/10"
                }
            `}
      >
        <Icon
          size={18}
          strokeWidth={active ? 3 : 2}
          className={`shrink-0 transition-transform duration-300 ${isCollapsed ? 'mx-auto' : ''} group-hover:scale-110`}
        />
        {!isCollapsed && (
          <span
            className={`text-sm tracking-tight ${
              active ? "font-black uppercase italic" : "font-bold"
            }`}
          >
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}

export default Sidebar;
