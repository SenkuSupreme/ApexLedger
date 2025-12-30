"use client";

import { useState } from "react";
import { X, Calendar, Flag, User, Tag } from "lucide-react";
import { ITask } from "@/lib/models/Task";

interface TaskFormProps {
  task?: ITask;
  onSave: (task: Partial<ITask>) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "",
    assignee: task?.assignee || "",
    tags: task?.tags?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: Partial<ITask> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as "low" | "medium" | "high",
      assignee: formData.assignee || undefined,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
    };

    if (formData.dueDate) {
      taskData.dueDate = new Date(formData.dueDate);
    }

    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] border border-white/20 rounded-xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onCancel}
            className="text-white/40 hover:text-white/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Flag size={14} className="inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <User size={14} className="inline mr-1" />
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Tag size={14} className="inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-white text-black py-3 px-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              {task ? "Update Task" : "Create Task"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white/10 text-white py-3 px-4 rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
