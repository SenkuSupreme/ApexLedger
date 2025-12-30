"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
import { ITask } from "@/lib/models/Task";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTask(params.id as string);
    }
  }, [params.id]);

  const fetchTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      } else {
        toast.error("Failed to fetch task");
        router.push("/tasks");
      }
    } catch (error) {
      toast.error("Error fetching task");
      router.push("/tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTask(updatedTask);
        toast.success("Task status updated");
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      toast.error("Error updating task");
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        router.push("/tasks");
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/20";
      case "low":
        return "text-green-500 bg-green-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="text-green-500" size={20} />;
      case "in-progress":
        return <Clock className="text-blue-500" size={20} />;
      default:
        return <Circle className="text-gray-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading Task Details...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60">
        Task not found
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/tasks")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Task Details
            </h1>
            <p className="text-white/70 text-sm font-medium">
              View and manage task information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/tasks/${task._id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Task Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className="text-sm text-white/60 capitalize">
                  {task.status.replace("-", " ")}
                </span>
              </div>
            </div>

            {task.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white/80 mb-2">
                  Description
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {/* Status Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange("todo")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  task.status === "todo"
                    ? "bg-gray-500/20 text-gray-300"
                    : "bg-white/10 hover:bg-white/20 text-white/70"
                }`}
                disabled={task.status === "todo"}
              >
                To Do
              </button>
              <button
                onClick={() => handleStatusChange("in-progress")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  task.status === "in-progress"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-white/10 hover:bg-white/20 text-white/70"
                }`}
                disabled={task.status === "in-progress"}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange("done")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  task.status === "done"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-white/10 hover:bg-white/20 text-white/70"
                }`}
                disabled={task.status === "done"}
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Properties */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Properties</h3>
            <div className="space-y-4">
              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Priority</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Due Date</span>
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar size={14} />
                    <span className="text-sm">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Assignee */}
              {task.assignee && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Assignee</span>
                  <div className="flex items-center gap-2 text-white/80">
                    <User size={14} />
                    <span className="text-sm">{task.assignee}</span>
                  </div>
                </div>
              )}

              {/* Created */}
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Created</span>
                <span className="text-white/80 text-sm">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Updated */}
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Updated</span>
                <span className="text-white/80 text-sm">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Tag size={18} />
                Tags
              </h3>
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
      </div>
    </div>
  );
}
