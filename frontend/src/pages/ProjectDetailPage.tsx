import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Pencil, Settings } from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import TaskBoard from "@/components/tasks/TaskBoard";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task, TaskStatus, User } from "@/types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, setProject, loading, error } = useProject(id!);
  const { createTask, updateTask, deleteTask } = useTasks(id!);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const isOwner = project?.ownerId === user?.id;

  // Unique members (owner + assignees)
  const members = useMemo(() => {
    if (!project) return [];
    const map = new Map<string, User>();
    map.set(project.owner.id, project.owner);
    project.tasks?.forEach((t) => {
      if (t.assignee) map.set(t.assignee.id, t.assignee);
    });
    return Array.from(map.values());
  }, [project]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!project?.tasks) return [];
    return project.tasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterAssignee !== "all" && t.assigneeId !== filterAssignee)
        return false;
      return true;
    });
  }, [project?.tasks, filterStatus, filterAssignee]);

  // Optimistic status change via drag-and-drop
  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      if (!project) return;

      const prevTasks = project.tasks!;
      // Optimistic update
      setProject({
        ...project,
        tasks: prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      });

      try {
        await updateTask(taskId, { status: newStatus });
      } catch {
        // Revert on failure
        setProject({ ...project, tasks: prevTasks });
        toast.error("Failed to update task status");
      }
    },
    [project, setProject, updateTask]
  );

  const handleCreateTask = async (data: Record<string, unknown>) => {
    const newTask = await createTask(data as Parameters<typeof createTask>[0]);
    if (project) {
      setProject({ ...project, tasks: [newTask, ...(project.tasks || [])] });
    }
    toast.success("Task created");
  };

  const handleEditTask = async (data: Record<string, unknown>) => {
    if (!editingTask || !project) return;
    const updated = await updateTask(
      editingTask.id,
      data as Parameters<typeof updateTask>[1]
    );
    setProject({
      ...project,
      tasks: project.tasks!.map((t) => (t.id === updated.id ? updated : t)),
    });
    setEditingTask(null);
    toast.success("Task updated");
  };

  const handleDeleteTask = async (taskId: string) => {
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
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!project) return;
    try {
      const { data } = await api.patch(`/projects/${project.id}`, {
        name: editName,
        description: editDesc || undefined,
      });
      setProject({ ...project, name: data.name, description: data.description });
      setEditProjectOpen(false);
      toast.success("Project updated");
    } catch {
      toast.error("Failed to update project");
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditName(project.name);
                  setEditDesc(project.description || "");
                  setEditProjectOpen(true);
                }}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={handleDeleteProject}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setTaskDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <TaskBoard
        tasks={filteredTasks}
        onStatusChange={handleStatusChange}
        onEdit={openEdit}
        onDelete={handleDeleteTask}
      />

      {/* Task Create/Edit Dialog */}
      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        members={members}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
      />

      {/* Edit Project Dialog */}
      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditProjectOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateProject}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
