import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Inbox } from "lucide-react";
import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "@/types";

const columnLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const columnStyles: Record<TaskStatus, { border: string, bg: string, ring: string, badge: string, iconColor: string, emptyMsg: string }> = {
  todo: {
    border: "border-t-blue-500",
    bg: "bg-blue-500/5 dark:bg-blue-900/10",
    ring: "ring-blue-500/30",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
    iconColor: "text-blue-500/50",
    emptyMsg: "Nothing to do yet"
  },
  in_progress: {
    border: "border-t-yellow-500",
    bg: "bg-yellow-500/5 dark:bg-yellow-900/10",
    ring: "ring-yellow-500/30",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300",
    iconColor: "text-yellow-500/50",
    emptyMsg: "Nothing in progress"
  },
  done: {
    border: "border-t-green-500",
    bg: "bg-green-500/5 dark:bg-green-900/10",
    ring: "ring-green-500/30",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300",
    iconColor: "text-green-500/50",
    emptyMsg: "Nothing completed yet"
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
      className={`flex flex-col rounded-xl border bg-muted/30 shadow-sm transition-colors ${style.border} ${
        isOver ? `ring-2 bg-muted/50 ${style.ring}` : ""
      }`}
    >
      <div className={`flex items-center justify-between p-3 rounded-t-xl border-b border-border/50 ${style.bg}`}>
        <h3 className="text-sm font-semibold tracking-tight">{columnLabels[status]}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2.5 p-2 pt-3 min-h-[160px] transition-all">
          {tasks.length === 0 ? (
            <div className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 py-10 text-center transition-opacity ${isOver ? 'opacity-30' : 'opacity-100'}`}>
              <Inbox className={`h-8 w-8 ${style.iconColor}`} />
              <p className="text-xs font-medium text-muted-foreground">
                {style.emptyMsg}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Drop a task here
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
