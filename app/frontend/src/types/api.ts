export type ProjectStatus = "planned" | "in_progress" | "completed" | "archived";
export type TaskStatus = "to_do" | "in_progress" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type AccountStatus = "active" | "suspended" | "deleted";

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  avatar_path: string | null;
  job_title: string | null;
  company: string | null;
  locale: string;
  timezone: string;
  account_status: AccountStatus;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Project {
  project_id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Task {
  task_id: number;
  project_id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  project: Project | null;
  user?: User;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export function getFullName(u: Pick<User, "first_name" | "last_name"> | null | undefined): string {
  if (!u) return "";
  return `${u.first_name} ${u.last_name}`.trim();
}

export function getInitials(u: Pick<User, "first_name" | "last_name"> | null | undefined): string {
  if (!u) return "?";
  return `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase() || "?";
}