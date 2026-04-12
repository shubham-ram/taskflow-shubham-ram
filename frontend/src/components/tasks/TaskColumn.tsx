import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "@/types";

const columnLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const columnStyles: Record<TaskStatus, string> = {
  todo: "border-t-blue-500",
  in_progress: "border-t-yellow-500",
  done: "border-t-green-500",
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskColumn({ status, tasks, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border border-t-4 bg-muted/40 ${columnStyles[status]} ${
        isOver ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-center justify-between p-3 pb-2">
        <h3 className="text-sm font-semibold">{columnLabels[status]}</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 p-2 pt-0 min-h-[120px]">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No tasks
            </p>
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
