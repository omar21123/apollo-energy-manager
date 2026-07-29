import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { getFullName, getInitials } from "@/types/api";
import { LayoutDashboard, FolderKanban, ListChecks, User as UserIcon, LogOut, Zap, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function NavItem({ to, exact, label, icon: Icon, onNavigate }: {
  to: string; exact?: boolean; label: string; icon: typeof LayoutDashboard; onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to as never}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_oklch(0.88_0.25_138_/_0.25)]"
          : "text-muted-foreground hover:bg-card hover:text-foreground",
      )}
    >
      <Icon className={cn("h-4 w-4", active && "text-primary")} />
      {label}
    </Link>
  );
}

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      <NavItem to="/" exact label="Dashboard" icon={LayoutDashboard} onNavigate={onNavigate} />
      <NavItem to="/projects" label="Projects" icon={FolderKanban} onNavigate={onNavigate} />
      <NavItem to="/tasks" label="Tasks" icon={ListChecks} onNavigate={onNavigate} />
      <NavItem to="/profile" label="Profile" icon={UserIcon} onNavigate={onNavigate} />
    </nav>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_oklch(0.88_0.25_138_/_0.08),_transparent_60%)]" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/60 bg-sidebar/80 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <Logo variant="compact" />
        </div>
        <div className="flex-1 px-3">
          <SidebarLinks />
        </div>
        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-card/60 px-3 py-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Apollo Green Solutions
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl lg:pl-72 lg:pr-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="lg:hidden">
            <Logo variant="mark" className="h-7 w-7" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-foreground">{getFullName(user)}</div>
            <div className="text-xs text-muted-foreground">{user?.job_title || user?.email}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border border-primary/30 bg-primary/10">
                  <AvatarFallback className="bg-transparent font-display font-semibold text-primary">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm">{getFullName(user)}</div>
                <div className="truncate text-xs font-normal text-muted-foreground">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile"><UserIcon className="mr-2 h-4 w-4" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/60 bg-sidebar p-4 lg:hidden"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.22 }}
            >
              <div className="mb-6 px-2 pt-2"><Logo variant="compact" /></div>
              <SidebarLinks onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative lg:pl-64">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}