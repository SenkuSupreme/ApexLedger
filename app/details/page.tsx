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
  Activity,
  Zap,
  Cpu,
  Shield,
  Layers,
  Brain
} from "lucide-react";
import { ITask } from "@/lib/models/Task";
import { IHabit } from "@/lib/models/Habit";
import { IGoal } from "@/lib/models/Goal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

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

  const [completionCount, setCompletionCount] = useState(1);
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    const type = searchParams.get("type") as ItemType;
    const id = searchParams.get("id");

    if (type) setActiveTab(type);
    fetchAllData();

    if (id && type) {
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
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      }
      if (habitsRes.ok) {
        const habitsData = await habitsRes.json();
        setHabits(habitsData.habits || []);
      }
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData.goals || []);
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
      case "task": item = tasks.find((t) => t._id === id); break;
      case "habit": item = habits.find((h) => h._id === id); break;
      case "goal": item = goals.find((g) => g._id === id); break;
    }
    if (item) setSelectedItem(item);
  };

  const handleDelete = async (item: ItemData, type: ItemType) => {
    try {
      const response = await fetch(`/api/${type}s/${item._id}`, { method: "DELETE" });
      if (response.ok) {
        switch (type) {
          case "task": setTasks(tasks.filter((t) => t._id !== item._id)); break;
          case "habit": setHabits(habits.filter((h) => h._id !== item._id)); break;
          case "goal": setGoals(goals.filter((g) => g._id !== item._id)); break;
        }
        setSelectedItem(null);
        toast.success("Item deleted");
      }
    } catch (error) {
      toast.error("Failed to delete item");
    }
    setDeleteDialog({ isOpen: false, item: null, type: null });
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
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
        toast.success("Status updated");
      }
    } catch (error) {}
  };

  const handleHabitComplete = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: completionCount, notes: completionNotes }),
      });
      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(habits.map((h) => (h._id === habitId ? updatedHabit : h)));
        setSelectedItem(updatedHabit);
        setCompletionCount(1);
        setCompletionNotes("");
        toast.success("Habit completed");
      }
    } catch (error) {}
  };

  const handleGoalProgressUpdate = async (goalId: string, newProgress: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: Math.max(0, Math.min(100, newProgress)) }),
      });
      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(goals.map((g) => (g._id === goalId ? updatedGoal : g)));
        setSelectedItem(updatedGoal);
        toast.success("Progress updated");
      }
    } catch (error) {}
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case "task": return tasks;
      case "habit": return habits;
      case "goal": return goals;
      default: return [];
    }
  };

  const getItemStatus = (item: ItemData, type: ItemType) => {
    switch (type) {
      case "task": return (item as ITask).status;
      case "habit": return (item as IHabit).isActive ? "active" : "inactive";
      case "goal": return (item as IGoal).status;
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-12 text-white font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 relative z-10 gap-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-5 bg-white/[0.03] hover:bg-white text-white/40 hover:text-black rounded-2xl border border-white/10 transition-all duration-300"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                 <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">Analysis Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/80">
                 <Brain size={10} className="text-purple-500/50" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Insights</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
              Item Details
            </h1>
            <p className="text-white/80 text-sm font-medium italic max-w-xl leading-relaxed">
              "Deep analysis of your tasks, habits, and goals. Monitor your progress and execution consistency over time."
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Tab Mesh */}
      <div className="flex gap-2 bg-white/[0.02] p-2 rounded-[2.5rem] border border-white/5 relative z-10 lg:max-w-xl">
        {[
          { id: "task", icon: <CheckSquare size={16} />, label: "Tasks", count: tasks.length },
          { id: "habit", icon: <Flame size={16} />, label: "Habits", count: habits.length },
          { id: "goal", icon: <Target size={16} />, label: "Goals", count: goals.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ItemType)}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === tab.id
                ? "bg-white text-black shadow-2xl shadow-white/10"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content Mesh */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* List View */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-6 py-2">
            <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] italic">
              {activeTab}s
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[8px] font-black text-purple-500/60 uppercase tracking-widest italic">Active</span>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {getCurrentItems().map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer overflow-hidden ${
                  selectedItem?._id === item._id
                    ? "bg-white/[0.08] border-white/20 shadow-3xl translate-x-1"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                 <div className="flex items-center justify-between mb-4 relative z-10">
                    <h4 className={`text-sm font-black tracking-tight uppercase italic transition-colors ${
                      selectedItem?._id === item._id ? "text-white" : "text-white/60 group-hover:text-white/80"
                    }`}>
                      {item.title}
                    </h4>
                    <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                      getItemStatus(item, activeTab) === 'done' || getItemStatus(item, activeTab) === 'completed'
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-white/5 text-white/50 border-white/5"
                    }`}>
                      {getItemStatus(item, activeTab)}
                    </div>
                 </div>
                 {item.description && (
                   <p className="text-[11px] text-white/40 font-medium italic line-clamp-2 relative z-10 group-hover:text-white/60 transition-colors">
                     "{item.description}"
                   </p>
                 )}
              </div>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <div className="lg:col-span-8">
           <div className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-[4rem] p-12 min-h-[60vh] hover:bg-[#0A0A0A]/60 transition-all duration-1000 shadow-3xl flex flex-col relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01] pointer-events-none" />
             <AnimatePresence mode="wait">
               {selectedItem ? (
                 <motion.div
                   key={selectedItem._id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="relative z-10 h-full flex flex-col"
                 >
                    {activeTab === 'habit' ? (
                      <div className="space-y-12">
                         <div className="flex items-start justify-between">
                           <div className="space-y-4">
                             <div className="flex items-center gap-4">
                               <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[9px] font-black uppercase tracking-widest italic">
                                 {(selectedItem as IHabit).category}
                               </span>
                               <span className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">
                                 {(selectedItem as IHabit).frequency}
                               </span>
                             </div>
                             <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                               {selectedItem.title}
                             </h2>
                             {selectedItem.description && (
                               <p className="text-white/60 font-medium italic text-sm">"{selectedItem.description}"</p>
                             )}
                           </div>
                           <button
                             onClick={() => setDeleteDialog({ isOpen: true, item: selectedItem, type: "habit" })}
                             className="p-5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-3xl border border-red-500/10 transition-all duration-500 shadow-xl"
                           >
                             <Trash2 size={24} />
                           </button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           {[
                             { icon: <Flame size={24} className="text-orange-500" />, value: (selectedItem as IHabit).streak, label: "Current Streak" },
                             { icon: <TrendingUp size={24} className="text-emerald-500" />, value: (selectedItem as IHabit).longestStreak, label: "Best Streak" },
                             { icon: <Activity size={24} className="text-blue-500" />, value: (selectedItem as IHabit).completions?.length || 0, label: "Total Completions" },
                           ].map((stat, i) => (
                             <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center group hover:bg-white/[0.04] transition-all duration-500">
                               <div className="mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                               <span className="text-4xl font-black italic tracking-tighter text-white">{stat.value}</span>
                               <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mt-3 italic">{stat.label}</span>
                             </div>
                           ))}
                         </div>

                         <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8">
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50 italic">Mark Completion</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                               <div className="md:col-span-1">
                                  <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3 block italic">Count</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={completionCount}
                                    onChange={(e) => setCompletionCount(Number(e.target.value))}
                                    className="w-full px-8 py-5 bg-black/40 border border-white/5 rounded-2xl text-white font-black text-lg focus:border-purple-500/30 focus:outline-none transition-all shadow-inner tabular-nums italic"
                                  />
                               </div>
                               <div className="md:col-span-3">
                                  <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3 block italic">Notes</label>
                                  <input
                                    type="text"
                                    value={completionNotes}
                                    onChange={(e) => setCompletionNotes(e.target.value)}
                                    placeholder="Enter notes here..."
                                    className="w-full px-8 py-5 bg-black/40 border border-white/5 rounded-2xl text-white placeholder:text-white/10 font-black focus:border-purple-500/30 focus:outline-none transition-all shadow-inner italic"
                                  />
                               </div>
                            </div>
                            <button
                              onClick={() => handleHabitComplete(selectedItem._id!)}
                              className="w-full bg-white text-black py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-purple-500 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95 italic overflow-hidden group"
                            >
                              <span className="relative z-10">Complete Habit</span>
                            </button>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-20 px-10">
                         <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-10 text-white/10">
                            {activeTab === 'task' ? <CheckSquare size={40} /> : <Target size={40} />}
                         </div>
                          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{selectedItem.title}</h2>
                          <p className="text-white/60 italic text-sm mb-12 max-w-lg">"{selectedItem.description || 'No description provided.'}"</p>
                          <div className="flex gap-4">
                             <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-500 hover:text-white transition-all italic">Edit</button>
                             <button onClick={() => setDeleteDialog({ isOpen: true, item: selectedItem, type: activeTab })} className="px-10 py-5 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all italic">Delete</button>
                          </div>
                      </div>
                    )}
                 </motion.div>
               ) : (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex-1 flex flex-col items-center justify-center text-white/10"
                 >
                    <div className="w-24 h-24 rounded-full bg-white/[0.01] border border-dashed border-white/5 flex items-center justify-center mb-8">
                      <Eye size={40} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.6em] italic">Select an Item</p>
                    <p className="mt-8 text-[9px] font-black italic text-white/10 tracking-[0.2em]">Select an item from the list to view its details.</p>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null, type: null })}
        onConfirm={() => deleteDialog.item && deleteDialog.type && handleDelete(deleteDialog.item, deleteDialog.type)}
        title="Delete Item"
        message={`Are you sure you want to delete this ${deleteDialog.type}? All associated data will be permanently removed.`}
      />
    </div>
  );
}
