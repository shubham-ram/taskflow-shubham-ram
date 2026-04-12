import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Project } from "@/types";

function useEditProjectForm(project: Project | null, open: boolean) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open && project) {
      reset({
        name: project.name,
        description: project.description || "",
      });
    }
  }, [open, project, reset]);

  return { control, handleSubmit, errors };
}

export default useEditProjectForm;
