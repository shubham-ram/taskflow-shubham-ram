import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task, User } from "@/types";
import getField from "@/form/getField";
import useTaskForm from "./hooks/useTaskForm";
import getTaskControls from "./config/controls";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  members: User[];
  onSubmit: (data: Record<string, string | undefined>) => Promise<void>;
}

export default function TaskFormDialog({
  open,
  onOpenChange,
  task,
  members,
  onSubmit,
}: Props) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!task;
  const { control, handleSubmit, errors } = useTaskForm(task);
  const taskControls = getTaskControls(members);

  const handleFormSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        assigneeId: data.assigneeId === "unassigned" ? undefined : data.assigneeId,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      };
      await onSubmit(payload);
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? "Failed to update task" : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {taskControls.map((config) => {
            const Element = getField(config.type);
            if (!Element) return null;
            return (
              <Element
                key={config.name}
                {...config}
                control={control}
                errors={errors}
              />
            );
          })}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save changes"
                  : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
