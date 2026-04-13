import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Project, PaginatedResponse, Pagination } from "@/types";

export function useProjects(page = 1, limit = 10) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Project>>(
        `/projects?page=${page}&limit=${limit}`,
      );
      const {
        data: projects,
        pagination,
      }: { data: Project[]; pagination: Pagination } = data || {};

      setProjects(projects);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    totalPages,
    total,
    loading,
    error,
    refetch: fetchProjects,
  };
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Project>(`/projects/${id}`);
      setProject(data);
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, setProject, loading, error, refetch: fetchProject };
}
