import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import getField from "@/form/getField";
import useCreateProjectForm from "./hooks/useCreateProjectForm";
import createProjectControls from "./config/controls";

interface Props {
  onCreated: () => void;
}

export default function CreateProjectDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset, errors } = useCreateProjectForm();

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await api.post("/projects", data);
      toast.success("Project created");
      reset();
      setOpen(false);
      onCreated();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {createProjectControls.map((config) => {
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
