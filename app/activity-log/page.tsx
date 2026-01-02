"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Target,
  Flame,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Activity,
  Database,
  Cpu,
  Shield
} from "lucide-react";
import { ITask } from "@/lib/models/Task";
import { IHabit } from "@/lib/models/Habit";
import { IGoal } from "@/lib/models/Goal";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityItem {
  id: string;
  type: "task" | "habit" | "goal";
  title: string;
  description?: string;
  status: string;
  completedAt: Date;
  category?: string;
  priority?: string;
  streak?: number;
  progress?: number;
  notes?: string;
  originalData: ITask | IHabit | IGoal;
}

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: "",
    type: "all",
    category: "all",
    dateRange: "all",
  });
  const [sort, setSort] = useState({ field: "completedAt", order: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchAllActivities();
  }, [sort]);

  const fetchAllActivities = async () => {
    try {
      const [tasksRes, habitsRes, goalsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/habits"),
        fetch("/api/goals"),
      ]);

      const [tasksData, habitsData, goalsData] = await Promise.all([
        tasksRes.ok ? tasksRes.json() : [],
        habitsRes.ok ? habitsRes.json() : { habits: [] },
        goalsRes.ok ? goalsRes.json() : { goals: [] },
      ]);

      const tasks = Array.isArray(tasksData) ? tasksData : [];
      const habits = habitsData.habits || [];
      const goals = goalsData.goals || [];

      const allActivities: ActivityItem[] = [];

      // Process completed tasks
      tasks
        .filter((task: ITask) => task.status === "done")
        .forEach((task: ITask) => {
          allActivities.push({
            id: task._id!,
            type: "task",
            title: task.title,
            description: task.description,
            status: "Completed",
            completedAt: new Date(task.updatedAt),
            priority: task.priority,
            originalData: task,
          });
        });

      // Process habit completions
      habits.forEach((habit: IHabit) => {
        habit.completions.forEach((completion) => {
          allActivities.push({
            id: `${habit._id}-${completion.date}`,
            type: "habit",
            title: habit.title,
            description: habit.description,
            status: "Completed",
            completedAt: new Date(completion.date),
            category: habit.category,
            streak: habit.streak,
            notes: completion.notes,
            originalData: habit,
          });
        });
      });

      // Process completed goals
      goals
        .filter((goal: IGoal) => goal.status === "completed")
        .forEach((goal: IGoal) => {
          allActivities.push({
            id: goal._id!,
            type: "goal",
            title: goal.title,
            description: goal.description,
            status: "Completed",
            completedAt: new Date(goal.updatedAt),
            category: goal.category,
            priority: goal.priority,
            progress: goal.progress,
            originalData: goal,
          });
        });

      // Sort activities
      allActivities.sort((a, b) => {
        const aValue = a.completedAt.getTime();
        const bValue = b.completedAt.getTime();
        return sort.order === "desc" ? bValue - aValue : aValue - bValue;
      });

      setActivities(allActivities);
    } catch (error) {
      toast.error("Failed to sync activity");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredActivities = () => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        activity.description
          ?.toLowerCase()
          .includes(filter.search.toLowerCase());

      const matchesType =
        filter.type === "all" || activity.type === filter.type;

      const matchesCategory =
        filter.category === "all" || activity.category === filter.category;

      const matchesDateRange = (() => {
        const now = new Date();
        const activityDate = activity.completedAt;

        switch (filter.dateRange) {
          case "today":
            return activityDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return activityDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return activityDate >= monthAgo;
          default:
            return true;
        }
      })();

      return (
        matchesSearch && matchesType && matchesCategory && matchesDateRange
      );
    });
  };

  const getPaginatedActivities = () => {
    const filtered = getFilteredActivities();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle size={14} className="text-blue-500" />;
      case "habit":
        return <Flame size={14} className="text-orange-500" />;
      case "goal":
        return <Target size={14} className="text-green-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "habit":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "goal":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-white/5 text-white/40 border-white/10";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "low":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-white/10 text-white/40";
    }
  };

  const { items, totalItems, totalPages } = getPaginatedActivities();

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading Activity...
      </div>
    );
  }

  return (
    <div className="space-y-12 text-white font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 relative z-10 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Activity Log Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/60">
               <Database size={10} className="text-blue-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sync Active</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
            Activity Log
          </h1>
          <p className="text-white/80 text-sm font-medium italic max-w-xl leading-relaxed">
            "Track your history of habit completions, task accomplishments, and goal milestones. Every action is a step towards mastery."
          </p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] italic mb-1">Total Actions</span>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl">
              <Activity size={12} className="text-blue-500/50" />
              <span className="text-xl font-black text-white italic tracking-tighter tabular-nums">{totalItems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Filter Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search actions..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="w-full pl-16 pr-8 py-6 bg-black/40 border border-white/5 rounded-[2rem] text-white placeholder:text-white/30 text-[11px] font-black uppercase tracking-[0.3em] focus:border-blue-500/30 focus:outline-none focus:bg-white/[0.04] transition-all backdrop-blur-md shadow-inner"
          />
        </div>

        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-8 py-6 bg-black/40 border border-white/5 rounded-[2rem] text-white text-[10px] font-black uppercase tracking-[0.2em] focus:border-blue-500/30 focus:outline-none transition-all cursor-pointer hover:bg-white/[0.04] backdrop-blur-md"
        >
          <option value="all">All Types</option>
          <option value="task">Tasks</option>
          <option value="habit">Habits</option>
          <option value="goal">Goals</option>
        </select>

        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="px-8 py-6 bg-black/40 border border-white/5 rounded-[2rem] text-white text-[10px] font-black uppercase tracking-[0.2em] focus:border-blue-500/30 focus:outline-none transition-all cursor-pointer hover:bg-white/[0.04] backdrop-blur-md"
        >
          <option value="all">All Domains</option>
          <option value="trading">Trading</option>
          <option value="health">Health</option>
          <option value="learning">Learning</option>
          <option value="productivity">Productivity</option>
          <option value="financial">Financial</option>
          <option value="personal">Personal</option>
        </select>

        <select
          value={filter.dateRange}
          onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
          className="px-8 py-6 bg-black/40 border border-white/5 rounded-[2rem] text-white text-[10px] font-black uppercase tracking-[0.2em] focus:border-blue-500/30 focus:outline-none transition-all cursor-pointer hover:bg-white/[0.04] backdrop-blur-md"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Past 7 Days</option>
          <option value="month">Past 30 Days</option>
        </select>
      </div>

      {/* Intelligence Ledger Mesh Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] overflow-hidden relative z-10 shadow-3xl group/ledger"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.02] blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/ledger:bg-blue-500/[0.05] transition-all duration-700" />
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/5">
                <th className="text-left py-8 px-10">
                  <button
                    onClick={() => handleSort("completedAt")}
                    className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] hover:text-white transition-colors italic"
                  >
                    Date
                    <ArrowUpDown size={14} className="opacity-40" />
                  </button>
                </th>
                <th className="text-left py-8 px-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
                  Type
                </th>
                <th className="text-left py-8 px-6">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] hover:text-white transition-colors italic"
                  >
                    Action
                    <ArrowUpDown size={14} className="opacity-40" />
                  </button>
                </th>
                <th className="text-left py-8 px-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
                  Domain
                </th>
                <th className="text-left py-8 px-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
                  Priority
                </th>
                <th className="text-left py-8 px-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
                  Metrics
                </th>
                <th className="text-left py-8 px-10 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic text-right">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((activity, index) => (
                <tr
                  key={activity.id}
                  className="group/row hover:bg-white/[0.03] transition-all duration-500"
                >
                  <td className="py-8 px-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/[0.03] rounded-[1.2rem] border border-white/5 group-hover/row:bg-white/10 transition-all">
                        <Calendar size={18} className="text-white/20 group-hover/row:text-white/60" />
                      </div>
                      <div>
                        <div className="text-[12px] font-black text-white uppercase italic tracking-tighter tabular-nums">
                          {activity.completedAt.toLocaleDateString()}
                        </div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-0.5 italic tabular-nums">
                          {activity.completedAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-6">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-[1rem] text-[9px] font-black uppercase tracking-widest border transition-all shadow-xl italic ${getTypeColor(
                          activity.type
                        )}`}
                      >
                         {activity.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-8 px-6">
                    <div className="text-[13px] font-black text-white uppercase italic tracking-tighter group-hover/row:text-blue-400 transition-colors">
                      {activity.title}
                    </div>
                    {activity.description && (
                      <div className="text-[11px] font-medium text-white/50 italic truncate max-w-[250px] mt-1.5 group-hover/row:text-white transition-all font-sans">
                        "{activity.description}"
                      </div>
                    )}
                  </td>
                  <td className="py-8 px-6">
                    {activity.category && (
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                         <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] italic">
                           {activity.category}
                         </span>
                      </div>
                    )}
                  </td>
                  <td className="py-8 px-6">
                    {activity.priority && (
                      <span
                        className={`px-4 py-2 rounded-[1rem] text-[9px] font-black uppercase tracking-widest border border-transparent shadow-inner ${getPriorityColor(
                          activity.priority
                        )}`}
                      >
                        {activity.priority}
                      </span>
                    )}
                  </td>
                  <td className="py-8 px-6">
                    {activity.type === "habit" && activity.streak !== undefined && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <Flame size={14} className="text-orange-500 animate-pulse" />
                        <span className="text-[11px] font-black text-orange-400 italic tabular-nums">{activity.streak} Streak</span>
                      </div>
                    )}
                    {activity.type === "goal" && activity.progress !== undefined && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <Target size={14} className="text-green-500" />
                          <span className="text-[11px] font-black text-green-400 italic tabular-nums">{activity.progress}%</span>
                        </div>
                      )}
                  </td>
                  <td className="py-8 px-10 text-right">
                    <Link
                      href={`/details?type=${activity.type}&id=${activity.originalData._id}`}
                      className="inline-flex h-12 w-12 items-center justify-center bg-white/[0.03] hover:bg-white text-white/20 hover:text-black rounded-[1.2rem] border border-white/5 transition-all duration-500 shadow-2xl active:scale-90"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center relative group/void">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
            <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center mb-10 group-hover/void:scale-110 transition-transform duration-700 relative z-10">
               <Cpu size={48} className="text-white/40" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic relative z-10">
              No Activity Found
            </h3>
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] italic max-w-sm leading-relaxed relative z-10">
              "No actions detected. Start completing tasks and habits to see your history here."
            </p>
          </div>
        )}

        {/* Institutional Pagination Matrix */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-10 border-t border-white/5 bg-white/[0.01] backdrop-blur-md">
            <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
               <Shield size={14} className="opacity-20" />
               <span>Showing {(currentPage - 1) * itemsPerPage + 1} — {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-14 w-14 flex items-center justify-center bg-white/[0.03] hover:bg-white text-white/40 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed rounded-[1.5rem] border border-white/5 transition-all duration-500 shadow-2xl active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="px-10 py-4 bg-white/[0.05] border border-white/5 rounded-[1.5rem] shadow-inner group/page">
                 <span className="text-[11px] font-black text-white uppercase italic tracking-widest group-hover/page:text-blue-400 transition-colors">Page {currentPage} / {totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-14 w-14 flex items-center justify-center bg-white/[0.03] hover:bg-white text-white/40 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed rounded-[1.5rem] border border-white/5 transition-all duration-500 shadow-2xl active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
