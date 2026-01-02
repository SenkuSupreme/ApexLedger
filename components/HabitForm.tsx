"use client";

import { useState, useEffect } from "react";
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

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-foreground">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] -z-10" />
      </div>

      <div className="bg-card/90 border border-border rounded-[3.5rem] p-10 w-full max-w-3xl shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Grain Effect */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-10 border-b border-border pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Protocol Configuration</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                {habit ? "Modify Ledger" : "Init Execution"}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Column */}
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Protocol Identifier</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-8 py-6 bg-foreground/[0.03] border border-border rounded-[2rem] text-foreground font-black uppercase italic tracking-tighter focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none shadow-inner text-lg"
                        placeholder="E.g. Daily Chart Review"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Institutional Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-8 py-6 bg-foreground/[0.03] border border-border rounded-[2rem] text-foreground/80 font-medium italic focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none resize-none shadow-inner leading-relaxed"
                        rows={6}
                        placeholder="Define the execution parameters and neural triggers..."
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Domain Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-widest focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none cursor-pointer appearance-none shadow-inner"
                        >
                          <option value="trading">Trading</option>
                          <option value="health">Health</option>
                          <option value="learning">Learning</option>
                          <option value="productivity">Productivity</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Cycle Frequency</label>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                          className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-widest focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none cursor-pointer appearance-none shadow-inner"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Target Execution Intensity</label>
                      <div className="bg-foreground/[0.02] border border-border rounded-[2rem] p-8 flex items-center justify-between group hover:bg-foreground/[0.04] transition-all">
                        <div className="space-y-1">
                          <p className="text-2xl font-black italic text-foreground">{formData.targetCount}</p>
                          <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">Logs / {formData.frequency.replace("ly", "")}</p>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, targetCount: Math.max(1, formData.targetCount - 1) })}
                            className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-muted-foreground/40 hover:bg-foreground hover:text-background transition-all active:scale-95"
                          >
                            -
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, targetCount: formData.targetCount + 1 })}
                            className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-muted-foreground/40 hover:bg-foreground hover:text-background transition-all active:scale-95"
                          >
                            +
                          </button>
                        </div>
                        <input type="hidden" value={formData.targetCount} {...(habit ? {} : { required: true })} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Metadata Fragments</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground/40 font-medium focus:bg-foreground/[0.06] focus:border-foreground/20 transition-all outline-none shadow-inner"
                        placeholder="Analysis, Edge, Review..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-10 border-t border-border mt-auto">
              <button
                type="submit"
                className="flex-1 bg-foreground text-background py-6 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(var(--foreground),0.1)] active:scale-95"
              >
                {habit ? "Commit Changes" : "Create Protocol"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-[0.5] bg-foreground/5 text-muted-foreground/40 py-6 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-border hover:bg-foreground/[0.08] hover:text-foreground transition-all active:scale-95"
              >
                Abort Sync
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
