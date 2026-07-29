import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Project, ProjectStatus, Task, TaskPriority, TaskStatus } from "@/types/api";
import { toast } from "sonner";

export const projectsKey = ["projects"] as const;
export const tasksKey = ["tasks"] as const;

export function useProjects() {
  return useQuery({
    queryKey: projectsKey,
    queryFn: async () => (await api.get<Project[]>("/projects")).data,
  });
}

export function useProject(id: number | string) {
  return useQuery({
    queryKey: ["project", String(id)],
    queryFn: async () => (await api.get<Project>(`/projects/${id}`)).data,
    enabled: id !== undefined && id !== null && String(id) !== "",
  });
}

export function useTasks() {
  return useQuery({
    queryKey: tasksKey,
    queryFn: async () => (await api.get<Task[]>("/tasks")).data,
  });
}

export interface ProjectInput {
  title: string;
  description?: string | null;
  status: ProjectStatus;
  start_date: string;
  end_date?: string | null;
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectInput) => (await api.post<Project>("/projects", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKey });
      toast.success("Project created");
    },
  });
}

export function useUpdateProject(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectInput) => (await api.put<Project>(`/projects/${id}`, input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKey });
      qc.invalidateQueries({ queryKey: ["project", String(id)] });
      toast.success("Project updated");
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api.delete(`/projects/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKey });
      qc.invalidateQueries({ queryKey: tasksKey });
      toast.success("Project deleted");
    },
  });
}

export interface TaskInput {
  project_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
}

export interface TaskUpdateInput {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TaskInput) => (await api.post<Task>("/tasks", input)).data,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: tasksKey });
      qc.invalidateQueries({ queryKey: ["project", String(vars.project_id)] });
      toast.success("Task created");
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: TaskUpdateInput }) =>
      (await api.put<Task>(`/tasks/${id}`, input)).data,
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: tasksKey });
      if (task?.project_id) qc.invalidateQueries({ queryKey: ["project", String(task.project_id)] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api.delete(`/tasks/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksKey });
      qc.invalidateQueries({ queryKey: projectsKey });
      toast.success("Task deleted");
    },
  });
}

export function useOptimisticTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, status }: { task: Task; status: TaskStatus }) => {
      const input: TaskUpdateInput = {
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        due_date: task.due_date,
      };
      return (await api.put<Task>(`/tasks/${task.task_id}`, input)).data;
    },
    onMutate: async ({ task, status }) => {
      await qc.cancelQueries({ queryKey: tasksKey });
      const prev = qc.getQueryData<Task[]>(tasksKey);
      qc.setQueryData<Task[]>(tasksKey, (old) =>
        old?.map((t) => (t.task_id === task.task_id ? { ...t, status } : t)) ?? old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(tasksKey, ctx.prev);
      toast.error("Failed to update task");
    },
    onSettled: (task) => {
      qc.invalidateQueries({ queryKey: tasksKey });
      if (task?.project_id) qc.invalidateQueries({ queryKey: ["project", String(task.project_id)] });
    },
  });
}