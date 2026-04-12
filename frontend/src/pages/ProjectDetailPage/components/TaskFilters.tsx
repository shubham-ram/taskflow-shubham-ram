import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types";

interface Props {
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterAssignee: string;
  onFilterAssigneeChange: (value: string) => void;
  members: User[];
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
}

export default function TaskFilters({
  filterStatus,
  onFilterStatusChange,
  filterAssignee,
  onFilterAssigneeChange,
  members,
  taskStats,
}: Props) {
  const isFiltered = filterStatus !== "all" || filterAssignee !== "all";

  const statusOptions = [
    { value: "all", label: "All", count: taskStats.total },
    {
      value: "todo",
      label: "Todo",
      count: taskStats.todo,
      color: "bg-blue-500",
    },
    {
      value: "in_progress",
      label: "In Progress",
      count: taskStats.inProgress,
      color: "bg-amber-500",
    },
    {
      value: "done",
      label: "Done",
      count: taskStats.done,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-2 border-b-2 border-border/40">
      {/* Pill status filter */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterStatusChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterStatus === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {opt.color && (
              <div
                className={`h-2 w-2 rounded-full ${opt.color} ${filterStatus !== opt.value && "opacity-70"}`}
              />
            )}
            {opt.label}
            <span
              className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                filterStatus === opt.value
                  ? "bg-muted text-foreground"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
        <Select value={filterAssignee} onValueChange={onFilterAssigneeChange}>
          <SelectTrigger className="w-[150px] h-8 text-xs bg-transparent border-border/40">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onFilterStatusChange("all");
              onFilterAssigneeChange("all");
            }}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
