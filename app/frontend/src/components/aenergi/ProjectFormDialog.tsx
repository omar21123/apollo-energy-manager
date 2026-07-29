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
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL } from "@/constants/enums";
import type { Project, ProjectStatus } from "@/types/api";
import { useCreateProject, useUpdateProject } from "@/lib/queries";
import { applyValidationErrors, extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const schema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(150, "Max 150 characters"),
    description: z.string().max(2000).optional(),
    status: z.enum(["planned", "in_progress", "completed", "archived"] as const),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
  })
  .refine(
    (v) => !v.end_date || v.end_date >= v.start_date,
    { message: "End date must be on or after start date", path: ["end_date"] },
  );

type Values = z.infer<typeof schema>;

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  project?: Project | null;
}) {
  const create = useCreateProject();
  const update = useUpdateProject(project?.project_id ?? 0);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "planned",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: project?.title ?? "",
        description: project?.description ?? "",
        status: (project?.status as ProjectStatus) ?? "planned",
        start_date: project?.start_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        end_date: project?.end_date?.slice(0, 10) ?? "",
      });
    }
  }, [open, project, form]);

  const onSubmit = async (values: Values) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      start_date: values.start_date,
      end_date: values.end_date || null,
    };
    try {
      if (project) await update.mutateAsync(payload);
      else await create.mutateAsync(payload);
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
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>Track a new energy initiative or update an existing one.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" {...form.register("start_date")} />
              {form.formState.errors.start_date && <p className="mt-1 text-xs text-destructive">{form.formState.errors.start_date.message}</p>}
            </div>
            <div>
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" type="date" {...form.register("end_date")} />
              {form.formState.errors.end_date && <p className="mt-1 text-xs text-destructive">{form.formState.errors.end_date.message}</p>}
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as ProjectStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {project ? "Save" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}