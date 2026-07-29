import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/aenergi/AuthShell";
import { api, extractErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify-email/$id/$hash")({
  head: () => ({ meta: [{ title: "Verify email — Aenergi" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { id, hash } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ message: string }>(`/email/verify/${id}/${hash}`);
        setMessage(data.message ?? "Email verified.");
        setState("ok");
      } catch (err) {
        setMessage(extractErrorMessage(err, "Invalid verification link."));
        setState("error");
      }
    })();
  }, [id, hash]);

  return (
    <AuthShell title="Email verification">
      <div className="flex flex-col items-center text-center">
        {state === "loading" && <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />}
        {state === "ok" && <CheckCircle2 className="mb-4 h-10 w-10 text-primary" />}
        {state === "error" && <XCircle className="mb-4 h-10 w-10 text-destructive" />}
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild className="mt-6 w-full"><Link to="/login">Go to sign in</Link></Button>
      </div>
    </AuthShell>
  );
}