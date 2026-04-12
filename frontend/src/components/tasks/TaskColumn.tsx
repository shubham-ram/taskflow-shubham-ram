import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "@/types";

const columnLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const columnStyles: Record<
  TaskStatus,
  {
    dot: string;
    headerBg: string;
    ring: string;
    badge: string;
    emptyMsg: string;
  }
> = {
  todo: {
    dot: "bg-blue-500",
    headerBg: "",
    ring: "ring-blue-500/20",
    badge: "text-muted-foreground",
    emptyMsg: "No tasks yet",
  },
  in_progress: {
    dot: "bg-amber-500",
    headerBg: "",
    ring: "ring-amber-500/20",
    badge: "text-muted-foreground",
    emptyMsg: "No tasks in progress",
  },
  done: {
    dot: "bg-emerald-500",
    headerBg: "",
    ring: "ring-emerald-500/20",
    badge: "text-muted-foreground",
    emptyMsg: "No completed tasks",
  },
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskColumn({ status, tasks, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const style = columnStyles[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full rounded-xl transition-all min-h-[280px] bg-muted/30 dark:bg-white/[0.02] backdrop-blur-sm border border-border/50 dark:border-white/[0.06] ${
        isOver ? `ring-2 ${style.ring} bg-muted/50 dark:bg-white/[0.05]` : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3.5 py-3">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <h3 className="text-sm font-semibold">{columnLabels[status]}</h3>
          <span className="text-xs text-muted-foreground font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 px-4 pb-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent mt-1">
          {tasks.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/40 py-8 text-center flex-1 transition-opacity ${
                isOver ? "opacity-30 scale-[0.98]" : "opacity-100"
              }`}
            >
              <Plus className="h-5 w-5 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground/50">
                {style.emptyMsg}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
