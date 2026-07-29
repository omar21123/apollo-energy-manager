import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useProject, useDeleteProject, useTasks, useDeleteTask } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { ProjectStatusBadge } from "@/components/aenergi/StatusBadge";
import { KanbanBoard } from "@/components/aenergi/KanbanBoard";
import { useState } from "react";
import { ProjectFormDialog } from "@/components/aenergi/ProjectFormDialog";
import { TaskFormDialog } from "@/components/aenergi/TaskFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";
import type { Task } from "@/types/api";
import { EmptyState } from "@/components/aenergi/EmptyState";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  head: ({ params }) => ({
    meta: [
      { title: `Project #${params.projectId} — Aenergi` },
      { name: "description", content: "Project detail and task Kanban board." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(projectId);
  const { data: allTasks = [] } = useTasks();
  const del = useDeleteProject();
  const delTask = useDeleteTask();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const projTasks = allTasks.filter((t) => t.project_id === Number(projectId));

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-card/40" />;
  if (!project) return <EmptyState title="Project not found" description="This project may have been deleted." action={<Button onClick={() => navigate({ to: "/projects" })}>Back to projects</Button>} />;

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-foreground">{project.title}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.description && <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>}
            <div className="mt-3 text-xs text-muted-foreground">
              {formatDate(project.start_date)} → {formatDate(project.end_date)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Tasks</h2>
        <Button size="sm" onClick={() => { setEditingTask(null); setTaskOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Add task
        </Button>
      </div>

      {projTasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Break this project down into a first task." action={
          <Button onClick={() => { setEditingTask(null); setTaskOpen(true); }}><Plus className="mr-2 h-4 w-4" />New task</Button>
        } />
      ) : (
        <KanbanBoard tasks={projTasks} onCardClick={(t) => { setEditingTask(t); setTaskOpen(true); }} />
      )}

      {editingTask && (
        <div className="fixed bottom-6 right-6 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Task actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => delTask.mutate(editingTask.task_id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <TaskFormDialog
        open={taskOpen}
        onOpenChange={(o) => { setTaskOpen(o); if (!o) setEditingTask(null); }}
        task={editingTask}
        defaultProjectId={project.project_id}
        lockProject
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              Its tasks stay, but their project link becomes empty. This can't be undone from the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={async () => {
                await del.mutateAsync(project.project_id);
                setConfirmOpen(false);
                navigate({ to: "/projects" });
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}