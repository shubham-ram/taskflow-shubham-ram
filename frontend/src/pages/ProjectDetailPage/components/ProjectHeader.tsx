import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/types";

interface Props {
  project: Project;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
}

export default function ProjectHeader({
  project,
  isOwner,
  onEdit,
  onDelete,
  onAddTask,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up mb-10">
      <div className="flex flex-col gap-1.5">
        <div className="mt-1">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the project{" "}
                    <span className="font-semibold text-foreground">
                      {project.name}
                    </span>{" "}
                    and all of its associated tasks. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        <Button size="sm" onClick={onAddTask} className="ml-2">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
