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
}

const statusOptions = [
  { value: "all", label: "All" },
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-1 border-b border-border/40">
      {/* Pill status filter */}
      <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterStatusChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterStatus === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
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
