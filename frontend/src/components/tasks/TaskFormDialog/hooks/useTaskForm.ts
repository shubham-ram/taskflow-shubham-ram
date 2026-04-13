import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Task } from "@/types";

const DEFAULT_VALUES = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assigneeId: "unassigned",
  dueDate: "",
};

function useTaskForm(task?: Task | null, open?: boolean) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId || "unassigned",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [task, open, reset]);

  return { control, handleSubmit, errors };
}

export default useTaskForm;
