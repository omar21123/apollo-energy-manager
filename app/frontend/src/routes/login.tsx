import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/aenergi/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  extractErrorMessage,
  isValidationError,
  applyValidationErrors,
} from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Log in — Aenergi" }],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type Values = z.infer<typeof schema>;

function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [needsVerify, setNeedsVerify] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    switch (status) {
      case "verified":
        toast.success(
          "Your email has been verified successfully. You can now sign in."
        );
        break;

      case "already_verified":
        toast.info("Your email is already verified. Please sign in.");
        break;

      case "invalid":
        toast.error("This verification link is invalid or has expired.");
        break;

      default:
        return;
    }

    // Remove the query string so the toast only appears once
    window.history.replaceState({}, "", "/login");
  }, []);

  useEffect(() => {
    if (token) {
      navigate({
        to: "/",
        replace: true,
      });
    }
  }, [token, navigate]);

  const onSubmit = async (values: Values) => {
    try {
      await login(values.email, values.password);

      toast.success("Welcome back");

      navigate({
        to: "/",
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setNeedsVerify(true);
        return;
      }

      if (axios.isAxiosError(err) && err.response?.status === 401) {
        form.setError("password", {
          message: "Wrong email or password",
        });
        return;
      }

      if (isValidationError(err)) {
        applyValidationErrors(err, form.setError);
      } else {
        toast.error(extractErrorMessage(err, "Sign in failed"));
      }
    }
  };

  if (needsVerify) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="Check your inbox to activate this account."
      >
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">
            {form.getValues("email")}
          </span>
          . Click it, then come back to sign in.
        </p>

        <Button
          className="mt-6 w-full"
          onClick={() => setNeedsVerify(false)}
        >
          Back to sign in
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Manage your energy portfolio."
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />

          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>

            <Link
              to="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              Forgot?
            </Link>
          </div>

          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />

          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          to="/register"
          className="text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}