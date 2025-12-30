"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Target,
  CheckSquare,
  Flame,
  Calendar,
  User,
  Tag,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Plus,
  Minus,
  TrendingUp,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { ITask } from "@/lib/models/Task";
import { IHabit } from "@/lib/models/Habit";
import { IGoal } from "@/lib/models/Goal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

type ItemType = "task" | "habit" | "goal";
type ItemData = ITask | IHabit | IGoal;

export default function DetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ItemType>("task");
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: ItemData | null;
    type: ItemType | null;
  }>({ isOpen: false, item: null, type: null });

  // Habit completion state
  const [completionCount, setCompletionCount] = useState(1);
  const [completionNotes, setCompletionNotes] = useState("");
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    const type = searchParams.get("type") as ItemType;
    const id = searchParams.get("id");

    if (type) {
      setActiveTab(type);
    }

    fetchAllData();

    if (id && type) {
      // Auto-select the item if ID is provided
      setTimeout(() => {
        selectItemById(id, type);
      }, 500);
    }
  }, [searchParams]);

  const fetchAllData = async () => {
    try {
      const [tasksRes, habitsRes, goalsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/habits"),
        fetch("/api/goals"),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
      if (habitsRes.ok) {
        const habitsData = await habitsRes.json();
        setHabits(habitsData);
      }
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData);
      }
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const selectItemById = (id: string, type: ItemType) => {
    let item: ItemData | undefined;
    switch (type) {
      case "task":
        item = tasks.find((t) => t._id === id);
        break;
      case "habit":
        item = habits.find((h) => h._id === id);
        break;
      case "goal":
        item = goals.find((g) => g._id === id);
        break;
    }
    if (item) {
      setSelectedItem(item);
    }
  };

  const handleDelete = async (item: ItemData, type: ItemType) => {
    try {
      const response = await fetch(`/api/${type}s/${item._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state
        switch (type) {
          case "task":
            setTasks(tasks.filter((t) => t._id !== item._id));
            break;
          case "habit":
            setHabits(habits.filter((h) => h._id !== item._id));
            break;
          case "goal":
            setGoals(goals.filter((g) => g._id !== item._id));
            break;
        }
        setSelectedItem(null);
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`
        );
      } else {
        toast.error(`Failed to delete ${type}`);
      }
    } catch (error) {
      toast.error(`Error deleting ${type}`);
    }
    setDeleteDialog({ isOpen: false, item: null, type: null });
  };

  const handleTaskStatusChange = async (
    taskId: string,
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
        setSelectedItem(updatedTask);
        toast.success("Task status updated");
      }
    } catch (error) {
      toast.error("Error updating task");
    }
  };

  const handleHabitComplete = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: completionCount,
          notes: completionNotes,
        }),
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(habits.map((h) => (h._id === habitId ? updatedHabit : h)));
        setSelectedItem(updatedHabit);
        setCompletionCount(1);
        setCompletionNotes("");
        toast.success("Habit completed!");
      }
    } catch (error) {
      toast.error("Error completing habit");
    }
  };

  const handleGoalProgressUpdate = async (
    goalId: string,
    newProgress: number
  ) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: Math.max(0, Math.min(100, newProgress)),
        }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(goals.map((g) => (g._id === goalId ? updatedGoal : g)));
        setSelectedItem(updatedGoal);
        toast.success("Progress updated");
      }
    } catch (error) {
      toast.error("Error updating progress");
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case "task":
        return tasks;
      case "habit":
        return habits;
      case "goal":
        return goals;
      default:
        return [];
    }
  };

  const getItemTitle = (item: ItemData) => {
    return item.title;
  };

  const getItemStatus = (item: ItemData, type: ItemType) => {
    switch (type) {
      case "task":
        return (item as ITask).status;
      case "habit":
        return (item as IHabit).isActive ? "active" : "inactive";
      case "goal":
        return (item as IGoal).status;
      default:
        return "";
    }
  };

  const renderItemList = () => {
    const items = getCurrentItems();

    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item._id}
            onClick={() => setSelectedItem(item)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-white/30 ${
              selectedItem?._id === item._id
                ? "bg-white/10 border-white/30"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">{getItemTitle(item)}</h4>
              <span className="text-xs text-white/60 capitalize">
                {getItemStatus(item, activeTab)}
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-white/60 mt-1 truncate">
                {item.description}
              </p>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-white/40">
            No {activeTab}s found
          </div>
        )}
      </div>
    );
  };

  const renderTaskDetails = (task: ITask) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{task.title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setDeleteDialog({ isOpen: true, item: task, type: "task" })
            }
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {task.description && <p className="text-white/70">{task.description}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => handleTaskStatusChange(task._id!, "todo")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            task.status === "todo"
              ? "bg-gray-500/20 text-gray-300"
              : "bg-white/10 hover:bg-white/20 text-white/70"
          }`}
        >
          To Do
        </button>
        <button
          onClick={() => handleTaskStatusChange(task._id!, "in-progress")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            task.status === "in-progress"
              ? "bg-blue-500/20 text-blue-300"
              : "bg-white/10 hover:bg-white/20 text-white/70"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => handleTaskStatusChange(task._id!, "done")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            task.status === "done"
              ? "bg-green-500/20 text-green-300"
              : "bg-white/10 hover:bg-white/20 text-white/70"
          }`}
        >
          Done
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-white/60">Priority:</span>
          <span className="ml-2 text-white capitalize">{task.priority}</span>
        </div>
        {task.dueDate && (
          <div>
            <span className="text-white/60">Due Date:</span>
            <span className="ml-2 text-white">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {task.assignee && (
          <div>
            <span className="text-white/60">Assignee:</span>
            <span className="ml-2 text-white">{task.assignee}</span>
          </div>
        )}
        <div>
          <span className="text-white/60">Created:</span>
          <span className="ml-2 text-white">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div>
          <h4 className="text-white/80 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHabitDetails = (habit: IHabit) => {
    const isCompletedToday = () => {
      const today = new Date().toDateString();
      return habit.completions.some(
        (c) =>
          new Date(c.date).toDateString() === today &&
          c.count >= habit.targetCount
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{habit.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setDeleteDialog({ isOpen: true, item: habit, type: "habit" })
              }
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {habit.description && (
          <p className="text-white/70">{habit.description}</p>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Flame size={20} />
              <span className="text-2xl font-bold">{habit.streak}</span>
            </div>
            <p className="text-xs text-white/60">Current Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-400">
              <TrendingUp size={20} />
              <span className="text-2xl font-bold">{habit.longestStreak}</span>
            </div>
            <p className="text-xs text-white/60">Best Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400">
              <Target size={20} />
              <span className="text-2xl font-bold">{habit.targetCount}</span>
            </div>
            <p className="text-xs text-white/60">Daily Target</p>
          </div>
        </div>

        {habit.isActive && !isCompletedToday() && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white mb-3">Complete Today</h4>
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={completionCount}
                  onChange={(e) => setCompletionCount(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleHabitComplete(habit._id!)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        )}

        {isCompletedToday() && (
          <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 text-center">
            <CheckCircle size={24} className="mx-auto text-green-400 mb-2" />
            <p className="text-green-400 font-medium">
              Completed for today! 🎉
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Category:</span>
            <span className="ml-2 text-white capitalize">{habit.category}</span>
          </div>
          <div>
            <span className="text-white/60">Frequency:</span>
            <span className="ml-2 text-white capitalize">
              {habit.frequency}
            </span>
          </div>
          <div>
            <span className="text-white/60">Status:</span>
            <span className="ml-2 text-white">
              {habit.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="text-white/60">Total Completions:</span>
            <span className="ml-2 text-white">{habit.completions.length}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderGoalDetails = (goal: IGoal) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{goal.title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setDeleteDialog({ isOpen: true, item: goal, type: "goal" })
            }
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {goal.description && <p className="text-white/70">{goal.description}</p>}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80">Progress</span>
          <span className="text-white">{goal.progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              handleGoalProgressUpdate(goal._id!, goal.progress - 5)
            }
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            disabled={goal.progress <= 0}
          >
            <Minus size={16} />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={goal.progress}
            onChange={(e) =>
              handleGoalProgressUpdate(goal._id!, Number(e.target.value))
            }
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() =>
              handleGoalProgressUpdate(goal._id!, goal.progress + 5)
            }
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            disabled={goal.progress >= 100}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-white/60">Category:</span>
          <span className="ml-2 text-white capitalize">{goal.category}</span>
        </div>
        <div>
          <span className="text-white/60">Priority:</span>
          <span className="ml-2 text-white capitalize">{goal.priority}</span>
        </div>
        <div>
          <span className="text-white/60">Status:</span>
          <span className="ml-2 text-white capitalize">
            {goal.status.replace("-", " ")}
          </span>
        </div>
        {goal.targetDate && (
          <div>
            <span className="text-white/60">Target Date:</span>
            <span className="ml-2 text-white">
              {new Date(goal.targetDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {goal.milestones && goal.milestones.length > 0 && (
        <div>
          <h4 className="text-white/80 mb-3">Milestones</h4>
          <div className="space-y-2">
            {goal.milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
              >
                {milestone.completed ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <Circle size={16} className="text-white/40" />
                )}
                <span
                  className={`${
                    milestone.completed
                      ? "line-through text-white/60"
                      : "text-white/80"
                  }`}
                >
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    if (!selectedItem) {
      return (
        <div className="flex items-center justify-center h-full text-white/40">
          <div className="text-center">
            <Eye size={48} className="mx-auto mb-4" />
            <p>Select an item to view details</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "task":
        return renderTaskDetails(selectedItem as ITask);
      case "habit":
        return renderHabitDetails(selectedItem as IHabit);
      case "goal":
        return renderGoalDetails(selectedItem as IGoal);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Details...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Details Dashboard
            </h1>
            <p className="text-white/70 text-sm font-medium">
              Manage your tasks, habits, and goals in one place
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("task")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === "task"
              ? "bg-white text-black"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <CheckSquare size={18} />
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab("habit")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === "habit"
              ? "bg-white text-black"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Flame size={18} />
          Habits ({habits.length})
        </button>
        <button
          onClick={() => setActiveTab("goal")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === "goal"
              ? "bg-white text-black"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Target size={18} />
          Goals ({goals.length})
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 capitalize">
              {activeTab}s
            </h3>
            <div className="max-h-96 overflow-y-auto">{renderItemList()}</div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 min-h-96">
            {renderDetails()}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, item: null, type: null })
        }
        onConfirm={() =>
          deleteDialog.item &&
          deleteDialog.type &&
          handleDelete(deleteDialog.item, deleteDialog.type)
        }
        title={`Delete ${deleteDialog.type
          ?.charAt(0)
          .toUpperCase()}${deleteDialog.type?.slice(1)}`}
        message={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
