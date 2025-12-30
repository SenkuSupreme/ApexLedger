"use client";

import {
  Plus,
  Calendar,
  User,
  MoreHorizontal,
  ArrowRight,
  Eye,
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
    <div className="flex gap-6 h-full overflow-x-auto">
      {columns.map((column) => (
        <div key={column.id} className="flex-1 min-w-80">
          <div
            className={`${column.color} border border-white/10 p-4 rounded-t-xl`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white tracking-tight">
                {column.title}
              </h3>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-mono">
                {getTasksByStatus(column.id).length}
              </span>
            </div>
          </div>

          <div
            className={`bg-white/5 border-l border-r border-b border-white/10 p-4 min-h-96 rounded-b-xl transition-colors ${
              dragOverColumn === column.id
                ? "bg-blue-500/20 border-blue-500/50"
                : ""
            }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task._id}
                draggable
                onDragStart={(e) => handleDragStart(e, task._id!)}
                onDragEnd={handleDragEnd}
                className={`bg-[#0A0A0A] border border-white/10 p-4 mb-3 rounded-xl hover:border-white/20 transition-all cursor-move select-none ${
                  draggedTask === task._id
                    ? "opacity-50 scale-95 rotate-2"
                    : "hover:scale-[1.02]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white flex-1">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        priorityColors[task.priority]
                      }`}
                    />
                    <div className="relative group">
                      <button className="text-white/40 hover:text-white/60 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                      <div className="absolute right-0 top-6 bg-[#0A0A0A] border border-white/20 rounded-lg shadow-xl p-2 hidden group-hover:block z-10 min-w-40">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() =>
                              router.push(`/details?type=task&id=${task._id}`)
                            }
                            className="text-left px-3 py-2 hover:bg-white/10 rounded text-sm flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                          >
                            <Eye size={12} />
                            View Details
                          </button>
                          {column.id !== "in-progress" && (
                            <button
                              onClick={() => moveTask(task._id!, "in-progress")}
                              className="text-left px-3 py-2 hover:bg-white/10 rounded text-sm flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            >
                              <ArrowRight size={12} />
                              Move to In Progress
                            </button>
                          )}
                          {column.id !== "done" && (
                            <button
                              onClick={() => moveTask(task._id!, "done")}
                              className="text-left px-3 py-2 hover:bg-white/10 rounded text-sm flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            >
                              <ArrowRight size={12} />
                              Move to Done
                            </button>
                          )}
                          {column.id !== "todo" && (
                            <button
                              onClick={() => moveTask(task._id!, "todo")}
                              className="text-left px-3 py-2 hover:bg-white/10 rounded text-sm flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            >
                              <ArrowRight size={12} />
                              Move to To Do
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDeleteDialog({ isOpen: true, task })
                            }
                            className="text-left px-3 py-2 hover:bg-red-500/20 text-red-400 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-white/60 mb-3">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-3">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{task.assignee}</span>
                      </div>
                    )}
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="bg-white/10 text-white/60 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {column.id === "todo" && (
              <button
                onClick={onCreateTask}
                className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-white/40 hover:border-white/30 hover:text-white/60 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Add Task
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
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteDialog.task?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
