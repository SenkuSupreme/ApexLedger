"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { IGoal } from "@/lib/models/Goal";

interface GoalFormProps {
  goal?: IGoal;
  onSave: (goal: Partial<IGoal>) => void;
  onCancel: () => void;
}

export default function GoalForm({ goal, onSave, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    category: goal?.category || "other",
    priority: goal?.priority || "medium",
    targetDate: goal?.targetDate
      ? new Date(goal.targetDate).toISOString().split("T")[0]
      : "",
    tags: goal?.tags?.join(", ") || "",
    milestones: goal?.milestones || [],
  });

  const [newMilestone, setNewMilestone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goalData: Partial<IGoal> = {
      title: formData.title,
      description: formData.description,
      category: formData.category as any,
      priority: formData.priority as "low" | "medium" | "high",
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
      milestones: formData.milestones,
    };

    if (formData.targetDate) {
      goalData.targetDate = new Date(formData.targetDate);
    }

    onSave(goalData);
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData({
        ...formData,
        milestones: [
          ...formData.milestones,
          { title: newMilestone.trim(), completed: false },
        ],
      });
      setNewMilestone("");
    }
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] border border-white/20 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {goal ? "Edit Goal" : "Create New Goal"}
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
              placeholder="Enter goal title"
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
              placeholder="Enter goal description"
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
                <option value="learning">Learning</option>
                <option value="financial">Financial</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) =>
                setFormData({ ...formData, targetDate: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Milestones
            </label>
            <div className="space-y-2">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => {
                      const updatedMilestones = [...formData.milestones];
                      updatedMilestones[index] = {
                        ...milestone,
                        title: e.target.value,
                      };
                      setFormData({
                        ...formData,
                        milestones: updatedMilestones,
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addMilestone())
                  }
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none transition-colors"
                  placeholder="Add milestone"
                />
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
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
              {goal ? "Update Goal" : "Create Goal"}
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
