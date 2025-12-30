"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { IHabit } from "@/lib/models/Habit";

interface HabitFormProps {
  habit?: IHabit;
  onSave: (habit: Partial<IHabit>) => void;
  onCancel: () => void;
}

export default function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [formData, setFormData] = useState({
    title: habit?.title || "",
    description: habit?.description || "",
    category: habit?.category || "other",
    frequency: habit?.frequency || "daily",
    targetCount: habit?.targetCount || 1,
    tags: habit?.tags?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const habitData: Partial<IHabit> = {
      title: formData.title,
      description: formData.description,
      category: formData.category as any,
      frequency: formData.frequency as "daily" | "weekly" | "monthly",
      targetCount: formData.targetCount,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
    };

    onSave(habitData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] border border-white/20 rounded-xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {habit ? "Edit Habit" : "Create New Habit"}
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
              placeholder="Enter habit title"
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
              placeholder="Enter habit description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
              >
                <option value="trading">Trading</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="productivity">Productivity</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Target Count
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.targetCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetCount: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
              placeholder="How many times per frequency period?"
            />
            <p className="text-xs text-white/40 mt-1">
              Number of times to complete this habit per{" "}
              {formData.frequency.slice(0, -2)} period
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
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
              {habit ? "Update Habit" : "Create Habit"}
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
