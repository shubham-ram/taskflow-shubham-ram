import { Filter, X } from "lucide-react";
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
}

const statusOptions = [
  { value: "all", label: "All tasks" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export default function TaskFilters({
  filterStatus,
  onFilterStatusChange,
  filterAssignee,
  onFilterAssigneeChange,
  members,
}: Props) {
  const isFiltered = filterStatus !== "all" || filterAssignee !== "all";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-muted/20 p-3 rounded-xl border border-border/50 animate-fade-in-up">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 mr-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Filter by:
          </span>
        </div>

        {/* Pill status filter */}
        <div className="flex items-center bg-muted/50 p-1 rounded-lg">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterStatusChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filterStatus === opt.value
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:ml-auto">
        <Select value={filterAssignee} onValueChange={onFilterAssigneeChange}>
          <SelectTrigger className="w-[160px] h-9 text-sm bg-background">
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
            className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
