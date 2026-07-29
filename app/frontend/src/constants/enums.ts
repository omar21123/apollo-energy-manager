import type { ProjectStatus, TaskPriority, TaskStatus } from "@/types/api";

export const PROJECT_STATUSES: ProjectStatus[] = ["planned", "in_progress", "completed", "archived"];
export const TASK_STATUSES: TaskStatus[] = ["to_do", "in_progress", "completed", "blocked"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "critical"];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  completed: "Completed",
  archived: "Archived",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  to_do: "To do",
  in_progress: "In progress",
  completed: "Completed",
  blocked: "Blocked",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  planned: "bg-slate-500/15 text-slate-300 border-slate-400/30",
  in_progress: "bg-amber-400/15 text-amber-300 border-amber-400/40",
  completed: "bg-primary/20 text-primary border-primary/40",
  archived: "bg-muted text-muted-foreground border-border",
};

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  to_do: "bg-slate-500/15 text-slate-300 border-slate-400/30",
  in_progress: "bg-amber-400/15 text-amber-300 border-amber-400/40",
  completed: "bg-primary/20 text-primary border-primary/40",
  blocked: "bg-red-500/15 text-red-300 border-red-500/40",
};

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "text-slate-400",
  medium: "text-amber-400",
  high: "text-orange-400",
  critical: "text-red-400",
};