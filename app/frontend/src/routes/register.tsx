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

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Aenergi" }] }),
  component: RegisterPage,
});

const schema = z.object({
  first_name: z.string().trim().min(1, "Required"),
  last_name: z.string().trim().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
});
type Values = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: {} });

  const onSubmit = async (values: Values) => {
    try {
      await api.post("/auth/register", values);
      navigate({ to: "/register/check-email", search: { email: values.email } });
    } catch (err) {
      if (!applyValidationErrors(err, form.setError)) toast.error(extractErrorMessage(err));
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join the Aenergi platform.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={form.formState.errors.first_name?.message}><Input {...form.register("first_name")} /></Field>
          <Field label="Last name" error={form.formState.errors.last_name?.message}><Input {...form.register("last_name")} /></Field>
        </div>
        <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" autoComplete="email" {...form.register("email")} /></Field>
        <Field label="Password" error={form.formState.errors.password?.message}><Input type="password" autoComplete="new-password" {...form.register("password")} /></Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Job title" error={form.formState.errors.job_title?.message}><Input {...form.register("job_title")} /></Field>
          <Field label="Company" error={form.formState.errors.company?.message}><Input {...form.register("company")} /></Field>
        </div>
        <Button type="submit" className="mt-2 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
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