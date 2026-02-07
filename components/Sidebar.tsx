"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

const DEFAULT_NAV_GROUPS = [
  {
    label: "Analytics",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/journal", icon: Book, label: "Journal" },
      { href: "/calendar", icon: Calendar, label: "Calendar" },
      { href: "/analytics/insights", icon: Sparkles, label: "Insights" },
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

// Helper to get icon component by name
const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Book, BookOpen, TrendingUp, Layers, BarChart3,
  Newspaper, Microscope, Timer, Trophy, CheckSquare, Target,
  Activity, Notebook, Calculator, Calendar, StickyNote, MessageCircle,
  Eye, Clock, Zap
};

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
  const [groups, setGroups] = useState(DEFAULT_NAV_GROUPS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const savedExpandedGroups = localStorage.getItem('sidebar-expanded-groups');
      const savedGroupOrder = localStorage.getItem('sidebar-group-order');
      const savedItemOrder = localStorage.getItem('sidebar-item-order');
      
      if (savedExpandedGroups) {
        setExpandedGroups(JSON.parse(savedExpandedGroups));
      }
      
      if (savedGroupOrder) {
        const groupOrder = JSON.parse(savedGroupOrder) as string[];
        // Reorder groups based on saved order
        setGroups(prev => {
          const orderedGroups = groupOrder
            .map(label => prev.find(g => g.label === label))
            .filter(Boolean) as typeof DEFAULT_NAV_GROUPS;
          // Add any groups that weren't in the saved order (new groups)
          const remainingGroups = prev.filter(g => !groupOrder.includes(g.label));
          return [...orderedGroups, ...remainingGroups];
        });
      }
      
      if (savedItemOrder) {
        const itemOrder = JSON.parse(savedItemOrder) as Record<string, string[]>;
        setGroups(prev => prev.map(group => {
          const savedOrder = itemOrder[group.label];
          if (savedOrder) {
            const orderedItems = savedOrder
              .map(href => group.items.find(item => item.href === href))
              .filter(Boolean) as typeof group.items;
            const remainingItems = group.items.filter(item => !savedOrder.includes(item.href));
            return { ...group, items: [...orderedItems, ...remainingItems] };
          }
          return group;
        }));
      }
    } catch (e) {
      console.error('Error loading sidebar state:', e);
    }
    setIsInitialized(true);
  }, []);

  // Save expanded groups to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sidebar-expanded-groups', JSON.stringify(expandedGroups));
    }
  }, [expandedGroups, isInitialized]);

  // Save group order to localStorage
  useEffect(() => {
    if (isInitialized) {
      const groupOrder = groups.map(g => g.label);
      localStorage.setItem('sidebar-group-order', JSON.stringify(groupOrder));
      
      const itemOrder: Record<string, string[]> = {};
      groups.forEach(g => {
        itemOrder[g.label] = g.items.map(item => item.href);
      });
      localStorage.setItem('sidebar-item-order', JSON.stringify(itemOrder));
    }
  }, [groups, isInitialized]);

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
      animate={{ width: isCollapsed ? 70 : 220 }}
      className="fixed left-0 top-0 h-full bg-[#050505]/95 backdrop-blur-3xl border-r border-white/5 z-40 flex flex-col transition-all duration-300 ease-in-out shadow-[30px_0_60px_rgba(0,0,0,0.8)]"
    >
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Logo Section */}
      <div className="h-14 flex items-center px-4 border-b border-white/5 relative overflow-hidden shrink-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
        <div className="flex items-center justify-center w-full relative z-10 transition-all duration-300">
        <div className="flex items-center justify-center w-full relative z-10 transition-all duration-300">
          {!isCollapsed ? (
            <div className="flex flex-col items-center">
              <span className="font-black text-xl tracking-tighter text-white italic leading-none">
                APEX<span className="text-white/30">LEDGER</span>
              </span>
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">Elite Terminal Core</span>
            </div>
          ) : (
             <div className="relative w-10 h-10 bg-black flex items-center justify-center">
               <Image 
                 src="/sidebar-logo.png" 
                 alt="Logo" 
                 fill
                 className="object-contain"
               />
             </div>
          )}
        </div>
        </div>

      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-2 w-6 h-12 bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-white/10 hover:border-sky-500/30 rounded-full flex items-center justify-center text-white/40 hover:text-sky-400 transition-all z-[100] group hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]"
      >
        <ChevronLeft
          size={14}
          strokeWidth={3}
          className={`transition-transform duration-500 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-2 space-y-2 relative z-10 bg-black">
        
        {/* AI Chat Button */}
        {/* AI Chat Button */}
        <Link href="/chat-with-ai" className="block mb-4 relative group/ai">
          <div className={`
            relative flex items-center gap-2.5 px-3 py-3 rounded-3xl transition-all duration-500 overflow-hidden border
            ${pathname === '/chat-with-ai' 
              ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/5 to-transparent border-indigo-500/30 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]' 
              : 'bg-zinc-900/40 hover:bg-zinc-800/60 text-white/40 hover:text-white border-white/5 hover:border-white/10'}
          `}>
             {/* Dynamic Noise Texture */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
             
             {/* Active Beam */}
             {pathname === '/chat-with-ai' && (
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_1px_rgba(99,102,241,0.8)]" />
             )}
             
            <div className={`shrink-0 relative z-10 ${isCollapsed ? 'mx-auto' : ''}`}>
               <div className={`p-2 rounded-xl transition-all duration-500 ${pathname === '/chat-with-ai' ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/30 group-hover/ai:text-indigo-300 group-hover/ai:bg-indigo-500/20 group-hover/ai:scale-110 group-hover/ai:rotate-12'}`}>
                   <Sparkles size={16} strokeWidth={2} className={pathname === '/chat-with-ai' ? 'animate-pulse' : ''} />
               </div>
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col relative z-10">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-black tracking-wider uppercase ${pathname === '/chat-with-ai' ? 'text-white' : 'text-white/60 group-hover/ai:text-white transition-colors'}`}>
                      AI Companion
                    </span>
                    {/* Status Dot */}
                    <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/chat-with-ai' ? 'bg-indigo-400 animate-ping' : 'bg-emerald-500/50 group-hover/ai:bg-emerald-400 transition-colors'}`} />
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${pathname === '/chat-with-ai' ? 'text-indigo-300/80' : 'text-white/20 group-hover/ai:text-white/40 transition-colors'}`}>
                    Neural Architecture
                </span>
              </div>
            )}
            
            {/* Hover Shine Effect */}
             <div className="absolute inset-0 translate-x-[-100%] group-hover/ai:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />
          </div>
        </Link>
        <div className="h-px bg-white/5 my-4" />

        <Reorder.Group axis="y" as="div" values={groups} onReorder={setGroups} className="space-y-2">
          {groups.map((group) => {
            const isExpanded = expandedGroups.includes(group.label);
            return (
              <Reorder.Item key={group.label} as="div" value={group} className="space-y-1.5 cursor-grab active:cursor-grabbing">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-black text-white/90 uppercase tracking-[0.4em] hover:text-white transition-all group select-none cursor-grab active:cursor-grabbing"
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
                          className="space-y-0.5"
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
                
                {!isCollapsed && <div className="h-2" />}
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
            className="fixed left-[75px] pointer-events-none z-50"
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
                relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group
                ${
                  active
                    ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] scale-[1.02] z-10"
                    : "text-white hover:bg-white/10"
                }
            `}
      >
        <Icon
          size={16}
          strokeWidth={active ? 3 : 2}
          className={`shrink-0 transition-transform duration-300 ${isCollapsed ? 'mx-auto' : ''} group-hover:scale-110`}
        />
        {!isCollapsed && (
          <span
            className={`text-xs tracking-tight ${
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
