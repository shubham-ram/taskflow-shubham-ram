import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/types";
import getField from "@/form/getField";
import useEditProjectForm from "./hooks/useEditProjectForm";
import editProjectControls from "./config/controls";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onUpdated: (updated: { name: string; description: string | null }) => void;
}

export default function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, errors } = useEditProjectForm(project, open);

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      const { data: updated } = await api.patch(`/projects/${project.id}`, {
        name: data.name,
        description: data.description || undefined,
      });
      onUpdated({ name: updated.name, description: updated.description });
      onOpenChange(false);
      toast.success("Project updated");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {editProjectControls.map((config) => {
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
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
