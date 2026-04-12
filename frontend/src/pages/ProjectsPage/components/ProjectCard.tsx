import { Link } from "react-router-dom";
import { FolderOpen, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Project } from "@/types";
import { format } from "date-fns";

interface Props {
  project: Project;
}

/** Hash a string into a consistent index for picking accent colors */
function hashToIndex(str: string, len: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % len;
}

const avatarColors = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProjectCard({ project }: Props) {
  const avatarIdx = hashToIndex(project.owner.id, avatarColors.length);
  const taskCount = project._count?.tasks ?? 0;

  return (
    <Link to={`/projects/${project.id}`} className="group block cursor-pointer">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderOpen className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold leading-tight">
                {project.name}
              </CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2 mt-1.5">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback
                  className={`text-[10px] font-medium ${avatarColors[avatarIdx]}`}
                >
                  {getInitials(project.owner.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {project.owner.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {format(new Date(project.createdAt), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
