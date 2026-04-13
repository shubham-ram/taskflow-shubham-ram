import { useCallback } from "react";
import { toast } from "sonner";
import { useTasks } from "./useTasks";
import type { Project, Task, TaskStatus } from "@/types";

interface UseTaskActionsParams {
  projectId: string;
  project: Project | null;
  setProject: (project: Project) => void;
}

export function useTaskActions({
  projectId,
  project,
  setProject,
}: UseTaskActionsParams) {
  const { createTask, updateTask, deleteTask } = useTasks(projectId);

  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      if (!project) return;

      const prevTasks = project.tasks!;
      setProject({
        ...project,
        tasks: prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t,
        ),
      });

      try {
        await updateTask(taskId, { status: newStatus });
      } catch {
        setProject({ ...project, tasks: prevTasks });
        toast.error("Failed to update task status");
      }
    },
    [project, setProject, updateTask],
  );

  const handleCreateTask = useCallback(
    async (data: Record<string, unknown>) => {
      const newTask = await createTask(
        data as Parameters<typeof createTask>[0],
      );
      if (project) {
        setProject({
          ...project,
          tasks: [newTask, ...(project.tasks || [])],
        });
      }
      toast.success("Task created");
    },
    [project, setProject, createTask],
  );

  const handleEditTask = useCallback(
    async (editingTask: Task, data: Record<string, unknown>) => {
      if (!project) return;
      const updated = await updateTask(
        editingTask.id,
        data as Parameters<typeof updateTask>[1],
      );
      setProject({
        ...project,
        tasks: project.tasks!.map((t) => (t.id === updated.id ? updated : t)),
      });
      toast.success("Task updated");
    },
    [project, setProject, updateTask],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!project) return;
      const prevTasks = project.tasks!;
      setProject({
        ...project,
        tasks: prevTasks.filter((t) => t.id !== taskId),
      });
      try {
        await deleteTask(taskId);
        toast.success("Task deleted");
      } catch {
        setProject({ ...project, tasks: prevTasks });
        toast.error("Failed to delete task");
      }
    },
    [project, setProject, deleteTask],
  );

  return {
    handleStatusChange,
    handleCreateTask,
    handleEditTask,
    handleDeleteTask,
  };
}
