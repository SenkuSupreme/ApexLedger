"use client";

import { useState, useEffect } from "react";
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-foreground">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] -z-10" />
      </div>

      <div className="bg-card/90 border border-border rounded-[3.5rem] p-10 w-full max-w-xl shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Grain Effect */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-10 border-b border-border pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Action Protocol</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                {task ? "Modify Node" : "Initialize Action"}
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
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Action Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-8 py-6 bg-foreground/[0.03] border border-border rounded-[2rem] text-foreground font-black uppercase italic tracking-tighter focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none shadow-inner text-lg"
                    placeholder="Enter task title..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Operational Scope</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-8 py-6 bg-foreground/[0.03] border border-border rounded-[2rem] text-foreground/80 font-medium italic focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none resize-none shadow-inner leading-relaxed"
                    rows={4}
                    placeholder="Define execution parameters..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Priority Index</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-widest focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none cursor-pointer appearance-none"
                    >
                      <option value="low">Low Intensity</option>
                      <option value="medium">Standard Shift</option>
                      <option value="high">Critical Sync</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Temporal Limit</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-8 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Operator Handle</label>
                  <div className="relative">
                    <User size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20" />
                    <input
                      type="text"
                      value={formData.assignee}
                      onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                      className="w-full pl-14 pr-6 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground font-black uppercase tracking-tighter focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none"
                      placeholder="Assign operator..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 block px-2">Signal Fragments</label>
                  <div className="relative">
                    <Tag size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20" />
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full pl-14 pr-6 py-5 bg-foreground/[0.03] border border-border rounded-2xl text-foreground/40 font-medium focus:bg-foreground/[0.06] focus:border-primary/20 transition-all outline-none"
                      placeholder="e.g., workflow, critical"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-10 border-t border-border mt-auto">
              <button
                type="submit"
                className="flex-1 bg-foreground text-background py-6 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(var(--foreground),0.1)] active:scale-95"
              >
                {task ? "Commit Node" : "Initialize Action"}
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
