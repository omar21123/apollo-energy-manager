import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeleteTask, useTasks } from "@/lib/queries";
import { useMemo, useState } from "react";
import { TASK_PRIORITIES, TASK_PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL } from "@/constants/enums";
import type { Task, TaskPriority, TaskStatus } from "@/types/api";
import { TaskStatusBadge } from "@/components/aenergi/StatusBadge";
import { PriorityDot } from "@/components/aenergi/PriorityDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, Pencil, FolderX } from "lucide-react";
import { TaskFormDialog } from "@/components/aenergi/TaskFormDialog";
import { EmptyState } from "@/components/aenergi/EmptyState";
import { formatRelativeDue } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Aenergi" },
      { name: "description", content: "All tasks across your energy projects." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const del = useDeleteTask();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (status === "all" || t.status === status))
      .filter((t) => (priority === "all" || t.priority === priority))
      .filter((t) => !q || t.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
  }, [tasks, status, priority, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tasks.length} task{tasks.length === 1 ? "" : "s"} across all projects.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpenNew(true); }}><Plus className="mr-2 h-4 w-4" />New task</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus | "all")}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{TASK_STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority | "all")}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TASK_PRIORITIES.map((s) => <SelectItem key={s} value={s}>{TASK_PRIORITY_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-card/40" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No tasks match" description="Try clearing filters or creating a new task." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-background/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Due</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((t) => {
                const due = formatRelativeDue(t.due_date);
                return (
                  <tr key={t.task_id} className="hover:bg-background/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground line-clamp-1">{t.title}</div>
                      {t.description && <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {t.project ? (
                        <Link to="/projects/$projectId" params={{ projectId: String(t.project.project_id) }} className="text-sm text-primary hover:underline">
                          {t.project.title}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          <FolderX className="h-3 w-3" />Project deleted
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3"><TaskStatusBadge status={t.status} /></td>
                    <td className="px-4 py-3"><PriorityDot priority={t.priority} /></td>
                    <td className={cn("px-4 py-3 text-xs", due.overdue && "text-destructive font-medium")}>{due.text}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpenNew(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => del.mutate(t.task_id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TaskFormDialog open={openNew} onOpenChange={(o) => { setOpenNew(o); if (!o) setEditing(null); }} task={editing} />
    </div>
  );
}