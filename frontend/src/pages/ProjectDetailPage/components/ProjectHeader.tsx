import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

interface Props {
  project: Project;
  isOwner: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
}

export default function ProjectHeader({
  project,
  isOwner,
  onBack,
  onEdit,
  onDelete,
  onAddTask,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </>
        )}
        <Button size="sm" onClick={onAddTask}>
          <Plus className="mr-1 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
