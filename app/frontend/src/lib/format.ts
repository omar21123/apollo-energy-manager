export function formatRelativeDue(iso: string | null): { text: string; overdue: boolean } {
  if (!iso) return { text: "No due date", overdue: false };
  const now = new Date();
  const due = new Date(iso);
  const ms = due.getTime() - new Date(now.toDateString()).getTime();
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: `Overdue by ${Math.abs(days)}d`, overdue: true };
  if (days === 0) return { text: "Due today", overdue: false };
  if (days === 1) return { text: "Due tomorrow", overdue: false };
  if (days < 7) return { text: `in ${days} days`, overdue: false };
  return { text: due.toLocaleDateString(undefined, { month: "short", day: "numeric" }), overdue: false };
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}