import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/aenergi/AppShell";
import { useEffect } from "react";
import { Logo } from "@/components/aenergi/Logo";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { token, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && !isLoading) navigate({ to: "/login", replace: true });
  }, [token, isLoading, navigate]);

  if (!token || (isLoading && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Logo variant="splash" />
      </div>
    );
  }
  return <AppShell />;
}

// AppShell renders <Outlet />, so we don't need to render it here again.
// keep Outlet import above referenced via re-export to avoid unused-import errors when the shell changes.
export const _outlet = Outlet;