import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TASK_PRIORITIES, TASK_PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL } from "@/constants/enums";
import type { Project, Task, TaskPriority, TaskStatus } from "@/types/api";
import { useCreateTask, useProjects, useUpdateTask } from "@/lib/queries";
import { applyValidationErrors, extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const baseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150, "Max 150 characters"),
  description: z.string().max(2000).optional(),
  status: z.enum(["to_do", "in_progress", "completed", "blocked"] as const),
  priority: z.enum(["low", "medium", "high", "critical"] as const),
  due_date: z.string().optional(),
  project_id: z.string().min(1, "Project is required"),
});

type Values = z.infer<typeof baseSchema>;

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultProjectId,
  lockProject,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task?: Task | null;
  defaultProjectId?: number;
  lockProject?: boolean;
}) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const { data: projects } = useProjects();
  const form = useForm<Values>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "to_do",
      priority: "medium",
      due_date: "",
      project_id: defaultProjectId ? String(defaultProjectId) : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        status: (task?.status as TaskStatus) ?? "to_do",
        priority: (task?.priority as TaskPriority) ?? "medium",
        due_date: task?.due_date?.slice(0, 10) ?? "",
        project_id: task ? String(task.project_id) : defaultProjectId ? String(defaultProjectId) : "",
      });
    }
  }, [open, task, defaultProjectId, form]);

  const onSubmit = async (values: Values) => {
    try {
      if (task) {
        await update.mutateAsync({
          id: task.task_id,
          input: {
            title: values.title,
            description: values.description || null,
            status: values.status,
            priority: values.priority,
            due_date: values.due_date || null,
          },
        });
        toast.success("Task updated");
      } else {
        await create.mutateAsync({
          project_id: Number(values.project_id),
          title: values.title,
          description: values.description || null,
          status: values.status,
          priority: values.priority,
          due_date: values.due_date || null,
        });
      }
      onOpenChange(false);
    } catch (err) {
      if (!applyValidationErrors(err, form.setError)) {
        toast.error(extractErrorMessage(err));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>{task ? "Update task details." : "Add a task to a project."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!task && (
            <div>
              <Label>Project</Label>
              <Select
                value={form.watch("project_id")}
                onValueChange={(v) => form.setValue("project_id", v)}
                disabled={lockProject}
              >
                <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  {(projects ?? []).map((p: Project) => (
                    <SelectItem key={p.project_id} value={String(p.project_id)}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.project_id && <p className="mt-1 text-xs text-destructive">{form.formState.errors.project_id.message}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} maxLength={150} />
            {form.formState.errors.title && <p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{TASK_STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.watch("priority")} onValueChange={(v) => form.setValue("priority", v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((s) => <SelectItem key={s} value={s}>{TASK_PRIORITY_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="due_date">Due date</Label>
            <Input id="due_date" type="date" {...form.register("due_date")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>{task ? "Save" : "Create task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}