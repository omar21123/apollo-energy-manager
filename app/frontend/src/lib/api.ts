import axios, { AxiosError } from "axios";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import type { ValidationError } from "@/types/api";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";

export const api = axios.create({ baseURL, headers: { Accept: "application/json" } });

const TOKEN_KEY = "aenergi_token";
const EXPIRES_KEY = "aenergi_expires_at";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, expiresInSeconds: number) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresInSeconds * 1000));
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EXPIRES_KEY);
}

export function getTokenExpiry(): number | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(EXPIRES_KEY);
  return v ? Number(v) : null;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && onUnauthorized) {
      clearToken();
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export function isValidationError(err: unknown): err is AxiosError<ValidationError> {
  return axios.isAxiosError(err) && err.response?.status === 422 && !!err.response.data?.errors;
}

export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.error || data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function applyValidationErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!isValidationError(err)) return false;
  const errors = err.response!.data.errors;
  for (const [field, messages] of Object.entries(errors)) {
    if (messages?.[0]) {
      setError(field as Path<T>, { type: "server", message: messages[0] });
    }
  }
  return true;
}