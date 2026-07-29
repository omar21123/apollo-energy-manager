import { cn } from "@/lib/utils";
import { TASK_PRIORITY_LABEL, TASK_PRIORITY_STYLES } from "@/constants/enums";
import type { TaskPriority } from "@/types/api";

export function PriorityDot({ priority, showLabel = true }: { priority: TaskPriority; showLabel?: boolean }) {
  const critical = priority === "critical";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", TASK_PRIORITY_STYLES[priority])}>
      <span className={cn("relative inline-block h-2 w-2 rounded-full bg-current", critical && "pulse-dot")} />
      {showLabel && TASK_PRIORITY_LABEL[priority]}
    </span>
  );
}