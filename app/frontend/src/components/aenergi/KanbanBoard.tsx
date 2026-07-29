import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import type { Task, TaskStatus } from "@/types/api";
import { TASK_STATUSES, TASK_STATUS_LABEL } from "@/constants/enums";
import { PriorityDot } from "./PriorityDot";
import { formatRelativeDue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOptimisticTaskStatus } from "@/lib/queries";
import { motion } from "framer-motion";

function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.task_id });
  const due = formatRelativeDue(task.due_date);
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "cursor-grab rounded-xl border border-border/60 bg-card/80 p-3 backdrop-blur transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground line-clamp-2">{task.title}</p>
        <PriorityDot priority={task.priority} showLabel={false} />
      </div>
      {task.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={cn("text-muted-foreground", due.overdue && "text-destructive font-medium")}>{due.text}</span>
        <PriorityDot priority={task.priority} />
      </div>
    </div>
  );
}

function Column({ status, tasks, onCardClick }: { status: TaskStatus; tasks: Task[]; onCardClick?: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{TASK_STATUS_LABEL[status]}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[400px] flex-col gap-2 rounded-2xl border border-dashed border-border/50 bg-background/40 p-2 transition-colors",
          isOver && "border-primary/60 bg-primary/5",
        )}
      >
        {tasks.map((t) => (
          <motion.div key={t.task_id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <TaskCard task={t} onClick={() => onCardClick?.(t)} />
          </motion.div>
        ))}
        {tasks.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground/60">Drop tasks here</div>}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onCardClick }: { tasks: Task[]; onCardClick?: (t: Task) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const move = useOptimisticTaskStatus();
  const [dragged, setDragged] = useState<Task | null>(null);

  const grouped: Record<TaskStatus, Task[]> = {
    to_do: [], in_progress: [], completed: [], blocked: [],
  };
  tasks.forEach((t) => grouped[t.status].push(t));

  const onDragStart = (e: DragStartEvent) => {
    const t = tasks.find((x) => x.task_id === e.active.id);
    setDragged(t ?? null);
  };
  const onDragEnd = (e: DragEndEvent) => {
    setDragged(null);
    if (!e.over) return;
    const task = tasks.find((t) => t.task_id === e.active.id);
    const newStatus = e.over.id as TaskStatus;
    if (task && task.status !== newStatus) move.mutate({ task, status: newStatus });
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUSES.map((s) => <Column key={s} status={s} tasks={grouped[s]} onCardClick={onCardClick} />)}
      </div>
      <DragOverlay>
        {dragged && (
          <div className="rotate-2 opacity-90"><TaskCard task={dragged} /></div>
        )}
      </DragOverlay>
    </DndContext>
  );
}