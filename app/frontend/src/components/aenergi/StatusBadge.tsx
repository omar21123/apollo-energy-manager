import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_STYLES, TASK_STATUS_LABEL, TASK_STATUS_STYLES } from "@/constants/enums";
import type { ProjectStatus, TaskStatus } from "@/types/api";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const pulse = status === "in_progress";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", PROJECT_STATUS_STYLES[status])}>
      {pulse && <span className="pulse-dot relative inline-block h-1.5 w-1.5 rounded-full bg-current" />}
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const pulse = status === "in_progress";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", TASK_STATUS_STYLES[status])}>
      {pulse && <span className="pulse-dot relative inline-block h-1.5 w-1.5 rounded-full bg-current" />}
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}