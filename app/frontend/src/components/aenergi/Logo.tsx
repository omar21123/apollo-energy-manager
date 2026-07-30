import { cn } from "@/lib/utils";

type Variant = "full" | "compact" | "mark" | "splash";

interface LogoProps {
  variant?: Variant;
  className?: string;
}

export function Logo({ variant = "compact", className }: LogoProps) {
  if (variant === "mark") {
    return <img src="/aenergi-logo.webp" alt="Aenergi" className={cn("h-8 w-8 object-contain", className)} />;
  }
  if (variant === "splash") {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
          <img src="/aenergi-logo.webp" alt="Aenergi" className="relative h-24 w-24 object-contain" />
        </div>
        <span className="font-display text-3xl font-bold tracking-tight text-foreground">Aenergi</span>
      </div>
    );
  }
  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <img src="/aenergi-logo.webp" alt="" className="h-14 w-14 object-contain shrink-0" />
        <div className="flex flex-col leading-none">
          <span className="font-display text-4xl font-bold tracking-tight text-foreground">Aenergi</span>
          <span
            className="mt-2 font-sans font-medium text-foreground/60"
            style={{ fontSize: "0.9rem", letterSpacing: "0.02em" }}
          >
            Your Energy Management System
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img src="/aenergi-logo.webp" alt="" className="h-8 w-8 object-contain shrink-0" />
      <span className="font-display text-xl font-bold tracking-tight text-foreground">Aenergi</span>
    </div>
  );
}