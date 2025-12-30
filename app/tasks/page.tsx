"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Search, CheckSquare, Clock, Target } from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard";
import TaskForm from "@/components/TaskForm";
import { ITask } from "@/lib/models/Task";
import { toast } from "sonner";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        toast.error("Failed to fetch tasks");
      }
    } catch (error) {
      toast.error("Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Partial<ITask>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
        setShowTaskForm(false);
        toast.success("Task created successfully");
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ITask>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) => (task._id === taskId ? updatedTask : task))
        );
        setEditingTask(undefined);
        setShowTaskForm(false);
        toast.success("Task updated successfully");
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      toast.error("Error updating task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskId));
        toast.success("Task deleted successfully");
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    highPriority: tasks.filter((t) => t.priority === "high").length,
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Task Board...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Action Tasks
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Organize and execute your trading workflow efficiently.
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
        >
          <Plus size={20} />
          NEW TASK
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Total Tasks
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock size={20} className="text-gray-500" />
            <span className="text-2xl font-bold text-white">{stats.todo}</span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            To Do
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-white">
              {stats.inProgress}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            In Progress
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckSquare size={20} className="text-green-500" />
            <span className="text-2xl font-bold text-white">{stats.done}</span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Completed
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target size={20} className="text-red-500" />
            <span className="text-2xl font-bold text-white">
              {stats.highPriority}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            High Priority
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-white/40" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 min-h-[600px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Task Board
            </h3>
            <p className="text-[11px] text-white/60 font-mono uppercase tracking-[0.2em]">
              Drag & Drop Workflow Management
            </p>
          </div>
        </div>

        <KanbanBoard
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onCreateTask={() => setShowTaskForm(true)}
        />
      </div>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSave={
            editingTask
              ? (updates) => handleUpdateTask(editingTask._id!, updates)
              : handleCreateTask
          }
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
        />
      )}
    </div>
  );
}
