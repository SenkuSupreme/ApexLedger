"use client";

import {
  Plus,
  Calendar,
  User,
  MoreHorizontal,
  CheckCircle,
  Circle,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";
import { ITask } from "@/lib/models/Task";
import { useState, DragEvent } from "react";
import { useRouter } from "next/navigation";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface KanbanBoardProps {
  tasks: ITask[];
  onUpdateTask: (taskId: string, updates: Partial<ITask>) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: () => void;
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-white/5" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-500/10" },
  { id: "done", title: "Done", color: "bg-green-500/10" },
];

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export default function KanbanBoard({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
}: KanbanBoardProps) {
  const router = useRouter();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    task: ITask | null;
  }>({ isOpen: false, task: null });

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const moveTask = (
    taskId: string,
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (columnId: string) => {
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    if (draggedTask && columnId !== draggedTask) {
      moveTask(draggedTask, columnId as "todo" | "in-progress" | "done");
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-10 h-full overflow-x-auto pb-10 custom-scrollbar relative z-10 font-sans">
      {columns.map((column) => (
        <div key={column.id} className="flex-1 min-w-[350px] flex flex-col group">
          <div
            className={`p-6 rounded-t-[2rem] border-t border-l border-r border-border bg-card/40 flex items-center justify-between group-hover:bg-card/60 transition-all duration-500`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${column.id === 'done' ? 'bg-green-500' : column.id === 'in-progress' ? 'bg-blue-500' : 'bg-muted-foreground/20'} animate-pulse`} />
              <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] italic">
                {column.title}
              </h3>
            </div>
            <span className="px-4 py-1.5 rounded-xl bg-foreground/5 border border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {getTasksByStatus(column.id).length} Nodes
            </span>
          </div>

          <div
            className={`flex-1 bg-background/40 border-l border-r border-b border-border p-5 min-h-[500px] rounded-b-[2rem] transition-all duration-500 ${
              dragOverColumn === column.id
                ? "bg-blue-500/[0.03] border-blue-500/30 ring-1 ring-blue-500/10"
                : ""
            }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="space-y-4">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id!)}
                  onDragEnd={handleDragEnd}
                  className={`group relative bg-card/40 border border-border p-6 rounded-[1.8rem] transition-all duration-500 cursor-grab active:cursor-grabbing hover:bg-card/60 hover:border-primary/20 shadow-xl ${
                    draggedTask === task._id
                      ? "opacity-20 scale-95 grayscale"
                      : "hover:scale-[1.02]"
                  }`}
                  onClick={() => router.push(`/details?type=task&id=${task._id}`)}
                >
                  {/* Background Glow */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/[0.03] blur-[50px] group-hover:bg-blue-500/[0.08] transition-all duration-700" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                         <span className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em]">{task.priority} Priority</span>
                      </div>
                      
                      {/* Persistent Action Node */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             setDeleteDialog({ isOpen: true, task });
                           }}
                           className="p-1.5 bg-red-500/5 hover:bg-red-500 text-red-500/40 hover:text-white rounded-lg border border-red-500/10 transition-all"
                         >
                           <Trash2 size={10} />
                         </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-foreground tracking-tighter uppercase italic leading-snug mb-3">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-muted-foreground/30 font-medium italic line-clamp-2 leading-relaxed mb-5">
                        "{task.description}"
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground/10 uppercase tracking-widest">
                            <Calendar size={10} className="text-blue-500/40" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                      </div>

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1.5">
                          {task.tags.slice(0, 1).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[8px] font-black text-muted-foreground/10 uppercase tracking-tighter bg-foreground/5 px-2 py-0.5 rounded-md border border-border"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {column.id === "todo" && (
              <button
                onClick={onCreateTask}
                className="w-full mt-6 py-8 border-2 border-dashed border-border rounded-[1.8rem] text-muted-foreground/10 hover:border-foreground/10 hover:bg-foreground/[0.02] hover:text-muted-foreground/30 flex flex-col items-center justify-center gap-3 transition-all duration-500 group"
              >
                <div className="p-3 bg-foreground/5 rounded-2xl group-hover:scale-110 transition-transform">
                   <Plus size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Node</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, task: null })}
        onConfirm={() => {
          if (deleteDialog.task) {
            onDeleteTask(deleteDialog.task._id!);
            setDeleteDialog({ isOpen: false, task: null });
          }
        }}
        title="Institutional Purge"
        message={`Terminate action node "${deleteDialog.task?.title}"? This protocol is irreversible.`}
      />
    </div>
  );
}
