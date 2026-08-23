import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Dumbbell, LogOut, Menu, Search, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { notifications } from "@/lib/mock-data";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { navForRole, type NavItem } from "./nav-config";

function SidebarContent({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Dumbbell className="size-5" />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-none">Smart Gym</p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">Fitness · Nutrition · Progress</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active =
            item.to === "/admin" || item.to === "/member" ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && (!user || user.role !== role)) {
      navigate({ to: "/", replace: true });
    }
  }, [ready, user, role, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const items = navForRole(role);
  const unread = notifications.filter((n) => n.audience === role && !n.read).length;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarContent items={items} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SidebarContent items={items} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur md:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">Toggle navigation</span>
          </Button>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search members, exercises, payments…" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ to: role === "ADMIN" ? "/admin/notifications" : "/member" })}
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                  {unread}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-muted">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {user.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-medium leading-tight">{user.name}</span>
                    <span className="block text-xs capitalize leading-tight text-muted-foreground">
                      {user.role.toLowerCase()}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === "MEMBER" && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/member/profile" })}>Profile</DropdownMenuItem>
                )}
                {role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin/settings" })}>Settings</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    navigate({ to: "/", replace: true });
                  }}
                >
                  <LogOut className="mr-2 size-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
