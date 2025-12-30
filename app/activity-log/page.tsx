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
} from "lucide-react";
import { ITask } from "@/lib/models/Task";
import { IHabit } from "@/lib/models/Habit";
import { IGoal } from "@/lib/models/Goal";
import { toast } from "sonner";
import Link from "next/link";

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
  }, []);

  const fetchAllActivities = async () => {
    try {
      const [tasksRes, habitsRes, goalsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/habits"),
        fetch("/api/goals"),
      ]);

      const [tasks, habits, goals] = await Promise.all([
        tasksRes.ok ? tasksRes.json() : [],
        habitsRes.ok ? habitsRes.json() : [],
        goalsRes.ok ? goalsRes.json() : [],
      ]);

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
      toast.error("Error fetching activities");
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
        return <CheckCircle size={16} className="text-blue-500" />;
      case "habit":
        return <Flame size={16} className="text-orange-500" />;
      case "goal":
        return <Target size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "habit":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "goal":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const { items, totalItems, totalPages } = getPaginatedActivities();

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Activity Log...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Activity Log
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Complete history of your tasks, habits, and goals
          </p>
        </div>
        <div className="text-white/60 text-sm">
          {totalItems} total activities
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              placeholder="Search activities..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/20 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="task">Tasks</option>
            <option value="habit">Habits</option>
            <option value="goal">Goals</option>
          </select>

          {/* Category Filter */}
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/20 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="trading">Trading</option>
            <option value="health">Health</option>
            <option value="learning">Learning</option>
            <option value="productivity">Productivity</option>
            <option value="financial">Financial</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filter.dateRange}
            onChange={(e) =>
              setFilter({ ...filter, dateRange: e.target.value })
            }
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/20 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left p-4 font-medium text-white/80">
                  <button
                    onClick={() => handleSort("completedAt")}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    Date
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-white/80">
                  Type
                </th>
                <th className="text-left p-4 font-medium text-white/80">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    Title
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-white/80">
                  Category
                </th>
                <th className="text-left p-4 font-medium text-white/80">
                  Priority
                </th>
                <th className="text-left p-4 font-medium text-white/80">
                  Details
                </th>
                <th className="text-left p-4 font-medium text-white/80">
                  Notes
                </th>
                <th className="text-left p-4 font-medium text-white/80">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((activity, index) => (
                <tr
                  key={activity.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    index % 2 === 0 ? "bg-white/2" : ""
                  }`}
                >
                  <td className="p-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-white/40" />
                      <span className="text-sm">
                        {activity.completedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-white/40">
                      {activity.completedAt.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(activity.type)}
                      <span
                        className={`px-2 py-1 rounded-lg text-xs border capitalize ${getTypeColor(
                          activity.type
                        )}`}
                      >
                        {activity.type}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">
                      {activity.title}
                    </div>
                    {activity.description && (
                      <div className="text-sm text-white/60 truncate max-w-xs">
                        {activity.description}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {activity.category && (
                      <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs capitalize">
                        {activity.category}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {activity.priority && (
                      <span
                        className={`px-2 py-1 rounded text-xs capitalize ${getPriorityColor(
                          activity.priority
                        )}`}
                      >
                        {activity.priority}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-white/70">
                    {activity.type === "habit" && activity.streak && (
                      <div className="flex items-center gap-1">
                        <Flame size={12} className="text-orange-400" />
                        <span>{activity.streak} streak</span>
                      </div>
                    )}
                    {activity.type === "goal" &&
                      activity.progress !== undefined && (
                        <div className="flex items-center gap-1">
                          <Target size={12} className="text-green-400" />
                          <span>{activity.progress}% complete</span>
                        </div>
                      )}
                  </td>
                  <td className="p-4 text-sm text-white/60">
                    {activity.notes && (
                      <div className="truncate max-w-xs" title={activity.notes}>
                        {activity.notes}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/details?type=${activity.type}&id=${activity.originalData._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
                    >
                      <Eye size={12} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No activities found
            </h3>
            <p className="text-white/60">
              {filter.search ||
              filter.type !== "all" ||
              filter.category !== "all"
                ? "Try adjusting your filters"
                : "Complete some tasks, habits, or goals to see them here"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="text-sm text-white/60">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              activities
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-sm">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
