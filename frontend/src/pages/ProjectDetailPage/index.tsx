import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProject } from "@/hooks/useProjects";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import TaskBoard from "@/components/tasks/TaskBoard";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task, User } from "@/types";
import ProjectHeader from "./components/ProjectHeader";
import EditProjectDialog from "./components/EditProjectDialog";
import TaskFilters from "./components/TaskFilters";
import { useTaskActions } from "./hooks/useTaskActions";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, setProject, loading, error } = useProject(id!);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  const isOwner = project?.ownerId === user?.id;

  const {
    handleStatusChange,
    handleCreateTask,
    handleEditTask,
    handleDeleteTask,
  } = useTaskActions({ projectId: id!, project, setProject });

  const members = useMemo(() => {
    if (!project) return [];
    const map = new Map<string, User>();
    map.set(project.owner.id, project.owner);
    project.tasks?.forEach((t) => {
      if (t.assignee) map.set(t.assignee.id, t.assignee);
    });
    return Array.from(map.values());
  }, [project]);

  const filteredTasks = useMemo(() => {
    if (!project?.tasks) return [];
    return project.tasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterAssignee !== "all" && t.assigneeId !== filterAssignee)
        return false;
      return true;
    });
  }, [project?.tasks, filterStatus, filterAssignee]);

  const taskStats = useMemo(() => {
    const all = project?.tasks ?? [];
    return {
      total: all.length,
      todo: all.filter((t) => t.status === "todo").length,
      inProgress: all.filter((t) => t.status === "in_progress").length,
      done: all.filter((t) => t.status === "done").length,
    };
  }, [project?.tasks]);

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await api.delete(`/projects/${project.id}`);
      toast.success("Project deleted");
      navigate("/projects", { replace: true });
    } catch {
      toast.error("Failed to delete project");
    }
  };

  useEffect(() => {
    if (project) {
      document.title = `${project.name} — TaskFlow`;
    } else {
      document.title = "TaskFlow — Task Management";
    }
    return () => {
      document.title = "TaskFlow — Task Management";
    };
  }, [project]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-destructive">{error || "Project not found"}</p>
        <Button onClick={() => navigate("/projects")} variant="outline">
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <ProjectHeader
        project={project}
        isOwner={isOwner}
        onEdit={() => setEditProjectOpen(true)}
        onDelete={handleDeleteProject}
        onAddTask={() => {
          setEditingTask(null);
          setTaskDialogOpen(true);
        }}
      />

      {/* Stats Summary */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">{taskStats.total}</span>
          <span className="text-muted-foreground">tasks</span>
        </div>
        <div className="h-4 w-px bg-border/60" />
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">{taskStats.todo} todo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">{taskStats.inProgress} in progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">{taskStats.done} done</span>
        </div>
      </div>

      <TaskFilters
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterAssignee={filterAssignee}
        onFilterAssigneeChange={setFilterAssignee}
        members={members}
      />

      <TaskBoard
        tasks={filteredTasks}
        onStatusChange={handleStatusChange}
        onEdit={(task) => {
          setEditingTask(task);
          setTaskDialogOpen(true);
        }}
        onDelete={handleDeleteTask}
      />

      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        members={members}
        onSubmit={
          editingTask
            ? (data) => handleEditTask(editingTask, data)
            : handleCreateTask
        }
      />

      <EditProjectDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={project}
        onUpdated={({ name, description }) =>
          setProject({ ...project, name, description })
        }
      />
    </div>
  );
}
