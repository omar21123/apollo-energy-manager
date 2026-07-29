import { createFileRoute } from "@tanstack/react-router";
import { useProjects, useTasks } from "@/lib/queries";
import { CountUp } from "@/components/aenergi/CountUp";
import { motion } from "framer-motion";
import { Zap, FolderKanban, ListChecks, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProjectFormDialog } from "@/components/aenergi/ProjectFormDialog";
import { TaskFormDialog } from "@/components/aenergi/TaskFormDialog";
import { ProjectStatusBadge, TaskStatusBadge } from "@/components/aenergi/StatusBadge";
import { Link } from "@tanstack/react-router";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/aenergi/EmptyState";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aenergi" },
      { name: "description", content: "Mission control for Apollo Green Solutions energy projects and tasks." },
      { property: "og:title", content: "Aenergi Dashboard" },
      { property: "og:description", content: "KPIs and activity across your energy portfolio." },
    ],
  }),
  component: Dashboard,
});

function Kpi({ label, value, icon: Icon, tone = "primary", suffix = "" }: {
  label: string; value: number; icon: typeof Zap; tone?: "primary" | "accent" | "warning" | "danger"; suffix?: string;
}) {
  const tones = {
    primary: "text-primary bg-primary/10 border-primary/20",
    accent: "text-accent bg-accent/10 border-accent/20",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    danger: "text-red-400 bg-red-500/10 border-red-500/20",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-shadow hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold text-foreground">
        <CountUp value={value} suffix={suffix} />
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  const [openProject, setOpenProject] = useState(false);
  const [openTask, setOpenTask] = useState(false);

  const active = projects.filter((p) => p.status === "in_progress").length;
  const overdue = tasks.filter((t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()).length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const recent = [
    ...projects.map((p) => ({ kind: "project" as const, id: p.project_id, title: p.title, at: p.updated_at, meta: <ProjectStatusBadge status={p.status} /> })),
    ...tasks.map((t) => ({ kind: "task" as const, id: t.task_id, title: t.title, at: t.updated_at, meta: <TaskStatusBadge status={t.status} /> })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time view of your energy portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenTask(true)}><ListChecks className="mr-2 h-4 w-4" />New task</Button>
          <Button onClick={() => setOpenProject(true)}><Zap className="mr-2 h-4 w-4" />New project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total projects" value={projects.length} icon={FolderKanban} tone="primary" />
        <Kpi label="Active" value={active} icon={Zap} tone="accent" />
        <Kpi label="Total tasks" value={tasks.length} icon={ListChecks} tone="primary" />
        <Kpi label="Overdue" value={overdue} icon={AlertTriangle} tone="danger" />
        <Kpi label="Completion" value={rate} suffix="%" icon={TrendingUp} tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No activity yet" description="Create your first project to see it here." />
          ) : (
            <ul className="divide-y divide-border/50">
              {recent.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.kind === "project" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                      {item.kind === "project" ? <FolderKanban className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(item.at)}</div>
                    </div>
                  </div>
                  {item.meta}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur">
          <h2 className="mb-4 font-display text-lg font-semibold">Quick jump</h2>
          <div className="flex flex-col gap-2">
            <Link to="/projects" className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm transition-colors hover:border-primary/40 hover:text-primary">
              → All projects ({projects.length})
            </Link>
            <Link to="/tasks" className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm transition-colors hover:border-primary/40 hover:text-primary">
              → All tasks ({tasks.length})
            </Link>
          </div>
        </div>
      </div>

      <ProjectFormDialog open={openProject} onOpenChange={setOpenProject} />
      <TaskFormDialog open={openTask} onOpenChange={setOpenTask} />
    </div>
  );
}