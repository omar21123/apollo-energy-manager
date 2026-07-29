import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/aenergi/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, applyValidationErrors, extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s) => z.object({ token: z.string().optional(), email: z.string().optional() }).parse(s),
  head: () => ({ meta: [{ title: "Reset password — Aenergi" }] }),
  component: ResetPage,
});

const schema = z.object({
  token: z.string().min(1, "Reset token is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  password_confirmation: z.string().min(1, "Required"),
}).refine((v) => v.password === v.password_confirmation, {
  path: ["password_confirmation"], message: "Passwords do not match",
});
type Values = z.infer<typeof schema>;

function ResetPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { token: search.token ?? "", email: search.email ?? "", password: "", password_confirmation: "" },
  });
  useEffect(() => {
    form.reset({ token: search.token ?? "", email: search.email ?? "", password: "", password_confirmation: "" });
  }, [search.token, search.email, form]);

  const onSubmit = async (values: Values) => {
    try {
      await api.post("/auth/reset-password", values);
      toast.success("Password reset. Please sign in.");
      navigate({ to: "/login" });
    } catch (err) {
      if (!applyValidationErrors(err, form.setError)) toast.error(extractErrorMessage(err));
    }
  };

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field>
        <Field label="Reset token" error={form.formState.errors.token?.message}><Input {...form.register("token")} /></Field>
        <Field label="New password" error={form.formState.errors.password?.message}><Input type="password" {...form.register("password")} /></Field>
        <Field label="Confirm password" error={form.formState.errors.password_confirmation?.message}><Input type="password" {...form.register("password_confirmation")} /></Field>
        <Button type="submit" className="mt-2 w-full" disabled={form.formState.isSubmitting}>Reset password</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}