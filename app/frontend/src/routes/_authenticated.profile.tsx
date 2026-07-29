import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { api, applyValidationErrors, extractErrorMessage } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getFullName, getInitials, type User } from "@/types/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatDateTime } from "@/lib/format";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Aenergi" },
      { name: "description", content: "Manage your Aenergi account." },
    ],
  }),
  component: Profile,
});

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Required"),
  last_name: z.string().trim().min(1, "Required"),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Min 8 characters"),
  new_password_confirmation: z.string().min(1, "Required"),
}).refine((v) => v.new_password === v.new_password_confirmation, {
  path: ["new_password_confirmation"],
  message: "Passwords do not match",
});
type PasswordValues = z.infer<typeof passwordSchema>;

function Profile() {
  const { user, logout, setUser } = useAuth();
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: {} });
  const pwd = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone ?? "",
        job_title: user.job_title ?? "",
        company: user.company ?? "",
      });
    }
  }, [user, form]);

  if (!user) return null;

  const onSave = async (values: ProfileValues) => {
    try {
      const { data } = await api.put<{ user: User; message: string }>("/auth/profile", values);
      setUser(data.user);
      toast.success(data.message ?? "Profile updated");
    } catch (err) {
      if (!applyValidationErrors(err, form.setError)) toast.error(extractErrorMessage(err));
    }
  };

  const onChangePassword = async (values: PasswordValues) => {
    try {
      const { data } = await api.put<{ message: string }>("/auth/change-password", values);
      toast.success(data.message ?? "Password changed");
      pwd.reset({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) {
      if (!applyValidationErrors(err, pwd.setError)) toast.error(extractErrorMessage(err));
    }
  };

  const resendVerification = async () => {
    try {
      const { data } = await api.post<{ message: string }>("/auth/email/verify");
      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your Aenergi profile.</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-primary/30 bg-primary/10">
            <AvatarFallback className="bg-transparent font-display text-xl font-semibold text-primary">{getInitials(user)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-display text-xl font-bold">{getFullName(user)}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className={`rounded-full border px-2 py-0.5 ${user.account_status === "active" ? "border-primary/40 bg-primary/15 text-primary" : "border-red-500/40 bg-red-500/10 text-red-400"}`}>{user.account_status}</span>
              {user.email_verified_at ? (
                <span className="text-muted-foreground">Verified {formatDate(user.email_verified_at)}</span>
              ) : (
                <button onClick={resendVerification} className="text-accent hover:underline">Resend verification email</button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
          <div><div className="text-[10px] uppercase tracking-wider">Member since</div><div className="mt-0.5 text-foreground">{formatDate(user.created_at)}</div></div>
          <div><div className="text-[10px] uppercase tracking-wider">Last login</div><div className="mt-0.5 text-foreground">{formatDateTime(user.last_login_at)}</div></div>
          <div><div className="text-[10px] uppercase tracking-wider">Locale</div><div className="mt-0.5 text-foreground">{user.locale}</div></div>
          <div><div className="text-[10px] uppercase tracking-wider">Timezone</div><div className="mt-0.5 text-foreground">{user.timezone}</div></div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur">
        <h2 className="font-display text-lg font-semibold">Profile details</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="First name" error={form.formState.errors.first_name?.message}><Input {...form.register("first_name")} /></Field>
          <Field label="Last name" error={form.formState.errors.last_name?.message}><Input {...form.register("last_name")} /></Field>
          <Field label="Email (read-only)"><Input value={user.email} disabled /></Field>
          <Field label="Phone" error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
          <Field label="Job title" error={form.formState.errors.job_title?.message}><Input {...form.register("job_title")} /></Field>
          <Field label="Company" error={form.formState.errors.company?.message}><Input {...form.register("company")} /></Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
        </div>
      </form>

      <form onSubmit={pwd.handleSubmit(onChangePassword)} className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur">
        <h2 className="font-display text-lg font-semibold">Change password</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Current password" error={pwd.formState.errors.current_password?.message}><Input type="password" {...pwd.register("current_password")} /></Field>
          <Field label="New password" error={pwd.formState.errors.new_password?.message}><Input type="password" {...pwd.register("new_password")} /></Field>
          <Field label="Confirm" error={pwd.formState.errors.new_password_confirmation?.message}><Input type="password" {...pwd.register("new_password_confirmation")} /></Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={pwd.formState.isSubmitting}>Update password</Button>
        </div>
      </form>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => logout()}><LogOut className="mr-2 h-4 w-4" />Log out</Button>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}