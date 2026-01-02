"use client";

import { useState, useEffect } from "react";
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

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-foreground">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10" />
      </div>

      <div className="bg-card/90 border border-border rounded-[3.5rem] p-10 w-full max-w-2xl shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Grain Effect */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Intelligence Target</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                {goal ? "Modify Objective" : "Initialize Goal"}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-4 bg-foreground/5 hover:bg-foreground text-muted-foreground/40 hover:text-background rounded-2xl border border-border transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 pb-10">
              <div className="space-y-10 p-2">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Objective Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-8 py-6 bg-foreground/[0.03] border border-border rounded-[2rem] text-foreground font-black uppercase italic tracking-tighter focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none shadow-inner text-lg"
                    placeholder="Enter objective title..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Operational Context</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-8 py-6 bg-foreground/[0.03] border border-border rounded-[2rem] text-foreground/80 font-medium italic focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none resize-none shadow-inner leading-relaxed"
                    rows={4}
                    placeholder="Describe the institutional target and expected outcome..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Domain Sector</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-widest focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none cursor-pointer appearance-none"
                      >
                        <option value="trading" className="bg-background">Trading</option>
                        <option value="learning" className="bg-background">Learning</option>
                        <option value="financial" className="bg-background">Financial</option>
                        <option value="personal" className="bg-background">Personal</option>
                        <option value="other" className="bg-background">Other</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/20">
                        <Plus size={14} className="rotate-45" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Priority Index</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-widest focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none cursor-pointer appearance-none"
                    >
                      <option value="low" className="bg-background">Low Intensity</option>
                      <option value="medium" className="bg-background">Standard Shift</option>
                      <option value="high" className="bg-background">Critical Sync</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Temporal Deadline</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none shadow-inner"
                  />
                </div>

                <div className="space-y-6 bg-foreground/[0.01] p-8 rounded-[3rem] border border-border">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Component Milestones</label>
                  <div className="space-y-4">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-4 bg-foreground/[0.02] p-2 rounded-2xl border border-border group hover:bg-foreground/[0.04] transition-all">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${milestone.completed ? "bg-green-500/20 text-green-500" : "bg-foreground/5 text-muted-foreground/20"}`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => {
                            const updatedMilestones = [...formData.milestones];
                            updatedMilestones[index] = { ...milestone, title: e.target.value };
                            setFormData({ ...formData, milestones: updatedMilestones });
                          }}
                          className="flex-1 px-4 py-3 bg-transparent border-none text-foreground italic font-bold focus:ring-0 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 pt-4">
                      <input
                        type="text"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMilestone())}
                        className="flex-1 px-8 py-5 bg-foreground/[0.01] border border-border rounded-2xl text-foreground italic placeholder:text-muted-foreground/10 focus:bg-foreground/[0.03] focus:border-primary/20 transition-all outline-none"
                        placeholder="Identify milestone signal..."
                      />
                      <button
                        type="button"
                        onClick={addMilestone}
                        className="p-5 bg-foreground text-background rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all shadow-xl active:scale-95"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Signal Fragments</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-muted-foreground font-medium focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none"
                    placeholder="e.g., EURUSD, analysis, setup"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-10 border-t border-border mt-auto">
              <button
                type="submit"
                className="flex-1 bg-foreground text-background py-6 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_20px_40px_rgba(var(--foreground),0.1)] active:scale-95"
              >
                {goal ? "Commit Objective" : "Initialize Target"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-[0.5] bg-foreground/5 text-muted-foreground/40 py-6 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-border hover:bg-foreground/[0.08] hover:text-foreground transition-all active:scale-95"
              >
                Abort Protocol
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
