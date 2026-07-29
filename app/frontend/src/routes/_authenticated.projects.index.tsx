import { createFileRoute, Link } from "@tanstack/react-router";
import { useProjects, useTasks } from "@/lib/queries";
import { useMemo, useState } from "react";
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL } from "@/constants/enums";
import type { ProjectStatus } from "@/types/api";
import { ProjectStatusBadge } from "@/components/aenergi/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Zap, CalendarDays } from "lucide-react";
import { ProjectFormDialog } from "@/components/aenergi/ProjectFormDialog";
import { EmptyState } from "@/components/aenergi/EmptyState";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Aenergi" },
      { name: "description", content: "Browse and manage energy projects." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: tasks = [] } = useTasks();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [openNew, setOpenNew] = useState(false);

  const progressByProject = useMemo(() => {
    const map = new Map<number, { total: number; done: number }>();
    tasks.forEach((t) => {
      const cur = map.get(t.project_id) ?? { total: 0, done: 0 };
      cur.total += 1;
      if (t.status === "completed") cur.done += 1;
      map.set(t.project_id, cur);
    });
    return map;
  }, [tasks]);

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">{projects.length} project{projects.length === 1 ? "" : "s"} across your portfolio.</p>
        </div>
        <Button onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />New project</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", statusFilter === "all" ? "border-primary/50 bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground")}
          >
            All
          </button>
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", statusFilter === s ? "border-primary/50 bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground")}
            >
              {PROJECT_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl border border-border/40 bg-card/40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Spin one up — track a solar install, an audit, or a grid upgrade."
          action={<Button onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />Create project</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const prog = progressByProject.get(p.project_id) ?? { total: 0, done: 0 };
            const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
            return (
              <motion.div key={p.project_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}>
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: String(p.project_id) }}
                  className="block h-full rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Zap className="h-4 w-4" />
                      </span>
                      <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">{p.title}</h3>
                    </div>
                    <ProjectStatusBadge status={p.status} />
                  </div>
                  {p.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(p.start_date)} → {formatDate(p.end_date)}
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{prog.done}/{prog.total} · {pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} className="h-full bg-gradient-to-r from-primary to-accent" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <ProjectFormDialog open={openNew} onOpenChange={setOpenNew} />
    </div>
  );
}