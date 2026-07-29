import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/aenergi/AuthShell";
import { Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register/check-email")({
  validateSearch: (s) => z.object({ email: z.string().optional() }).parse(s),
  head: () => ({ meta: [{ title: "Check your email — Aenergi" }] }),
  component: CheckEmail,
});

function CheckEmail() {
  const { email } = Route.useSearch();
  return (
    <AuthShell title="Check your inbox" subtitle="One more step to activate your account.">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          We sent a verification link{email ? <> to <span className="font-medium text-foreground">{email}</span></> : ""}. Click it to activate Aenergi.
        </p>
        <Button asChild className="mt-6 w-full"><Link to="/login">Back to sign in</Link></Button>
      </div>
    </AuthShell>
  );
}