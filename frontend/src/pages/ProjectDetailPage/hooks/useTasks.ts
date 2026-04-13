import { useCallback } from "react";
import api from "@/lib/api";
import type { Task } from "@/types";

export function useTasks(projectId: string) {
  const createTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      assigneeId?: string;
      dueDate?: string;
    }) => {
      const res = await api.post<Task>(
        `/projects/${projectId}/tasks`,
        data
      );
      return res.data;
    },
    [projectId]
  );

  const updateTask = useCallback(
    async (taskId: string, data: Partial<Task>) => {
      const res = await api.patch<Task>(`/tasks/${taskId}`, data);
      return res.data;
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
  }, []);

  return { createTask, updateTask, deleteTask };
}
