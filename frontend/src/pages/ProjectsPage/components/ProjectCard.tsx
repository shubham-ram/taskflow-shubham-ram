import { Link } from "react-router-dom";
import { FolderOpen, ListTodo } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";
import { format } from "date-fns";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{project.name}</CardTitle>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <ListTodo className="h-3 w-3" />
              {project._count?.tasks ?? 0}
            </Badge>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Owned by {project.owner.name} &middot;{" "}
            {format(new Date(project.createdAt), "MMM d, yyyy")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
