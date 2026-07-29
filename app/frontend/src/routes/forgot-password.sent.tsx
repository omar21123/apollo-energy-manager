import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/aenergi/AuthShell";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forgot-password/sent")({
  head: () => ({ meta: [{ title: "Reset link sent — Aenergi" }] }),
  component: Sent,
});

function Sent() {
  return (
    <AuthShell title="Check your inbox">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">We emailed you a password reset link.</p>
        <Button asChild className="mt-6 w-full"><Link to="/login">Back to sign in</Link></Button>
      </div>
    </AuthShell>
  );
}