import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, Pencil, Trash2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task } from "@/types";
import { format, isPast, isToday } from "date-fns";

const priorityConfig = {
  low: { border: "border-l-blue-500", dot: "bg-blue-500", label: "Low Priority" },
  medium: { border: "border-l-yellow-500", dot: "bg-yellow-500", label: "Medium Priority" },
  high: { border: "border-l-red-500", dot: "bg-red-500", label: "High Priority" },
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const config = priorityConfig[task.priority] || priorityConfig.low;
  
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && !isToday(dueDateObj) && task.status !== "done";

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`group relative overflow-hidden transition-all hover:shadow-md ${isDragging ? 'ring-2 ring-primary cursor-grabbing scale-[1.02]' : 'cursor-pointer'}`}
    >
      <CardContent className="p-3">
        <div className="flex gap-2">
          {/* Drag Handle */}
          <div 
            className="mt-0.5 -ml-1 text-muted-foreground/30 hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded hidden sm:block"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className="flex flex-1 flex-col gap-2 min-w-0" {...(window.innerWidth < 640 ? {...attributes, ...listeners} : {})}>
            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-start gap-1.5 min-w-0 pr-1">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${config.dot}`} title={config.label} />
                <p className="font-medium text-[13px] sm:text-sm leading-snug break-words">{task.title}</p>
              </div>

              {/* Actions - visible on hover */}
              <div className="flex -mt-1 -mr-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit task</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete task</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-[12px] text-muted-foreground line-clamp-2 sm:pl-3.5">
                {task.description}
              </p>
            )}

            {/* Meta Footer */}
            <div className="flex items-center justify-between sm:pl-3.5 mt-1">
              <div className="flex items-center gap-2">
                {dueDateObj && (
                  <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${
                    isOverdue 
                      ? "bg-destructive/10 text-destructive" 
                      : "text-muted-foreground bg-muted/60"
                  }`}>
                    {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                    {format(dueDateObj, "MMM d")}
                  </span>
                )}
              </div>
              
              {task.assignee && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-5 w-5 border border-border shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-[9px] text-primary font-medium">
                        {getInitials(task.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>Assigned to {task.assignee.name}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
