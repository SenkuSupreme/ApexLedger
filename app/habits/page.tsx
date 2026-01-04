"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Search,
  Flame,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Zap,
  Cpu,
  Globe,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HabitCard from "@/components/HabitCard";
import HabitForm from "@/components/HabitForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { IHabit } from "@/lib/models/Habit";
import { toast } from "sonner";

export default function HabitsPage() {
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<IHabit | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits");
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits || []);
      } else {
        toast.error("Failed to fetch habits");
      }
    } catch (error) {
      toast.error("Protocol sync error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (habitData: Partial<IHabit>) => {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habitData),
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits([newHabit, ...habits]);
        setShowHabitForm(false);
        toast.success("Execution protocol initialized");
      } else {
        toast.error("Protocol failure");
      }
    } catch (error) {
      toast.error("System error");
    }
  };

  const handleUpdateHabit = async (
    habitId: string,
    updates: Partial<IHabit>
  ) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(
          habits.map((habit) => (habit._id === habitId ? updatedHabit : habit))
        );
        setEditingHabit(undefined);
        setShowHabitForm(false);
        toast.success("Protocol recalibrated");
      } else {
        toast.error("Recalibration failure");
      }
    } catch (error) {
      toast.error("System error");
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabitToDelete(habitId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;

    try {
      const response = await fetch(`/api/habits/${habitToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHabits(habits.filter((habit) => habit._id !== habitToDelete));
        toast.success("Protocol purged from matrix");
      } else {
        toast.error("Purge failure");
      }
    } catch (error) {
      toast.error("System error");
    } finally {
      setHabitToDelete(null);
    }
  };

  const handleCompleteHabit = async (
    habitId: string,
    count: number,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, notes }),
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(
          habits.map((habit) => (habit._id === habitId ? updatedHabit : habit))
        );
        toast.success("Execution artifact registered");
      } else {
        toast.error("Registration failure");
      }
    } catch (error) {
      toast.error("System error");
    }
  };

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch =
      (habit.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      habit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || habit.category === filterCategory;
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && habit.isActive) ||
      (filterActive === "inactive" && !habit.isActive);
    return matchesSearch && matchesCategory && matchesActive;
  });

  const stats = {
    total: habits.length,
    active: habits.filter((h) => h.isActive).length,
    totalStreak: habits.reduce((sum, h) => sum + h.streak, 0),
    avgStreak:
      habits.length > 0
        ? Math.round(
            habits.reduce((sum, h) => sum + h.streak, 0) / habits.length
          )
        : 0,
    completedToday: habits.filter((h) => {
      const today = new Date().toDateString();
      return h.completions.some(
        (c) =>
          new Date(c.date).toDateString() === today && c.count >= h.targetCount
      );
    }).length,
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-muted-foreground font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading Habits...
      </div>
    );
  }

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
        <div className="pt-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Habits Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-muted-foreground">
               <Activity size={10} className="text-blue-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sync: Active</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Habits
          </h1>
          <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Build and track your trading habits. Consistency is the key to mastering your edge and achieving long-term success in the markets."
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => setShowHabitForm(true)}
            className="group relative flex items-center gap-4 bg-foreground text-background hover:bg-blue-500 hover:text-white px-8 py-3.5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">New Habit</span>
          </button>
        </div>
      </div>

      {/* Intelligence Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
        {[
          { icon: <Target size={18} />, label: "Total Habits", value: stats.total, color: "blue" },
          { icon: <Database size={18} />, label: "Active Habits", value: stats.active, color: "emerald" },
          { icon: <Calendar size={18} />, label: "Completed Today", value: stats.completedToday, color: "purple" },
          { icon: <Flame size={18} />, label: "Total Streak", value: stats.totalStreak, color: "orange" },
          { icon: <TrendingUp size={18} />, label: "Avg Streak", value: stats.avgStreak, color: "yellow" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-8 group hover:bg-card/60 transition-all duration-500 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="p-3 bg-foreground/5 border border-border rounded-2xl text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all">
                   {stat.icon}
                </div>
                <span className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-foreground transition-colors">{stat.value}</span>
             </div>
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic">
                {stat.label}
             </div>
          </div>
        ))}
      </div> */}

      {/* Institutional Filter Mesh */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        <div className="flex-1 relative group">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors"
          />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-card/40 border border-border rounded-[2.5rem] text-foreground placeholder:text-muted-foreground/20 text-[11px] font-black uppercase tracking-[0.3em] focus:border-primary/30 focus:outline-none focus:bg-card/60 transition-all shadow-inner"
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-8 py-5 bg-card/40 border border-border rounded-[2rem] text-foreground text-[10px] font-black uppercase tracking-[0.2em] focus:border-primary/30 focus:outline-none transition-all cursor-pointer hover:bg-card/60 backdrop-blur-md"
          >
            <option value="all" className="bg-background">All Categories</option>
            {["trading", "health", "learning", "productivity", "other"].map(cat => <option key={cat} value={cat} className="bg-background">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-8 py-5 bg-card/40 border border-border rounded-[2rem] text-foreground text-[10px] font-black uppercase tracking-[0.2em] focus:border-primary/30 focus:outline-none transition-all cursor-pointer hover:bg-card/60 backdrop-blur-md"
          >
            <option value="all" className="bg-background">All States</option>
            <option value="active" className="bg-background">Active</option>
            <option value="inactive" className="bg-background">Inactive</option>
          </select>
        </div>
      </div>

      {/* Habits Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredHabits.map((habit, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={habit._id || index}
            >
              <HabitCard
                habit={habit}
                onUpdate={handleUpdateHabit}
                onDelete={handleDeleteHabit}
                onEdit={(habit) => {
                  setEditingHabit(habit);
                  setShowHabitForm(true);
                }}
                onComplete={handleCompleteHabit}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredHabits.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full py-40 text-center relative group overflow-hidden bg-foreground/[0.01] border border-dashed border-border rounded-[3.5rem]"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
          <Flame size={64} className="text-muted-foreground/40 mx-auto mb-8 relative z-10" />
          <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter italic">No Habits Found</h3>
          <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.4em] mb-12 max-w-sm mx-auto italic leading-relaxed">
            "Your habits list is empty. Start by creating a new habit to begin tracking your consistency."
          </p>
          <button
            onClick={() => setShowHabitForm(true)}
            className="group relative inline-flex items-center gap-4 bg-foreground text-background hover:bg-primary hover:text-white px-12 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">Create Habit</span>
          </button>
        </motion.div>
      )}

      {showHabitForm && (
        <HabitForm
          habit={editingHabit}
          onSave={
            editingHabit
              ? (updates) => handleUpdateHabit(editingHabit._id!, updates)
              : handleCreateHabit
          }
          onCancel={() => {
            setShowHabitForm(false);
            setEditingHabit(undefined);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Terminate Protocol?"
        description="This will permanently delete this execution protocol and all associated data. This action is irreversible."
        confirmText="Terminate"
        cancelText="Cancel"
      />
    </div>
  );
}
