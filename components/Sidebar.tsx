"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Book,
  TrendingUp,
  Settings,
  LogOut,
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
} from "lucide-react";
import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";

const navGroups = [
  {
    label: "Analytics",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/journal", icon: Book, label: "Journal" },
      { href: "/calendar", icon: Calendar, label: "Calendar" },
      { href: "/bias", icon: Eye, label: "Bias Review" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/chart", icon: BarChart3, label: "Chart" },
      { href: "/news", icon: Newspaper, label: "News" },
      { href: "/research", icon: Microscope, label: "Research" },
      { href: "/sessions", icon: Timer, label: "Sessions" },
    ],
  },
  {
    label: "Strategy",
    items: [
      { href: "/strategies", icon: Layers, label: "Strategies" },
      { href: "/checklists", icon: CheckSquare, label: "Checklists" },
      { href: "/backtester", icon: TrendingUp, label: "Backtester" },
      { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/tasks", icon: CheckSquare, label: "Tasks" },
      { href: "/goals", icon: Target, label: "Goals" },
      { href: "/habits", icon: Activity, label: "Habits" },
      { href: "/activity-log", icon: StickyNote, label: "Activity Log" },
      { href: "/notebook", icon: Notebook, label: "Notebook" },
      { href: "/calculator", icon: Calculator, label: "Calculator" },
    ],
  },
  {
    label: "System",
    items: [{ href: "/settings", icon: Settings, label: "Settings" }],
  },
];

// Mock Eye icon since it's used above but might not be imported from lucide
import { Eye } from "lucide-react";

const Sidebar = React.memo(function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-full bg-black border-r border-white/5 z-50 flex flex-col transition-all duration-300 ease-in-out"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <TrendingUp size={18} className="text-black" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-black text-xl tracking-tighter text-white"
            >
              APEX<span className="text-white/40 font-black">LEDGER</span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all z-50 group shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:border-white/40"
      >
        <ChevronLeft
          size={14}
          className={`transition-transform duration-500 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-6 px-3">
        <nav className="space-y-8">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 text-[11px] font-black text-white/60 uppercase tracking-[0.25em] mb-4"
                >
                  {group.label}
                </motion.h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={pathname === item.href}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Exit Trading */}
      <div className="p-4 border-t border-white/10 bg-white/1">
        {isCollapsed ? (
          <button
            onClick={() => signOut()}
            className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-red-500 transition-colors mx-auto"
            title="Exit Trading"
          >
            <LogOut size={20} />
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-sm font-bold shadow-inner">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {session?.user?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-white/70 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-all border border-transparent tracking-widest"
            >
              <LogOut size={18} />
              EXIT TRADING
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
});

function NavItem({ href, icon: Icon, label, active, isCollapsed }: any) {
  return (
    <Link href={href}>
      <div
        className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                ${
                  active
                    ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }
            `}
      >
        {active && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 bg-white rounded-xl z-[-1]"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Icon
          size={isCollapsed ? 22 : 18}
          strokeWidth={active ? 2.5 : 2}
          className="shrink-0"
        />
        {!isCollapsed && (
          <span
            className={`text-[14px] font-semibold tracking-tight ${
              active ? "font-bold" : ""
            }`}
          >
            {label}
          </span>
        )}
        {isCollapsed && (
          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-100 shadow-2xl">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-white" />
          </div>
        )}
      </div>
    </Link>
  );
}

export default Sidebar;
