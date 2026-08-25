import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Apple, Dumbbell, LineChart, Loader2, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Gym — Gym Management & Fitness Tracking" },
      {
        name: "description",
        content:
          "Smart Gym is an all-in-one gym management and fitness tracking platform for admins and members: memberships, payments, attendance, workouts, nutrition and progress.",
      },
      { property: "og:title", content: "Smart Gym — Gym Management & Fitness Tracking" },
      {
        property: "og:description",
        content:
          "Manage memberships, payments and attendance while members track workouts, nutrition and progress in one premium dashboard.",
      },
    ],
  }),
  component: LandingPage,
});

const highlights = [
  { icon: Dumbbell, title: "Workout tracking", text: "Guided splits, live set timer and performance history." },
  { icon: Apple, title: "Nutrition & macros", text: "Indian food database with calorie and macro targets." },
  { icon: LineChart, title: "Progress analytics", text: "Weight, measurements and strength trends over time." },
  { icon: Activity, title: "Attendance & QR", text: "Check-in tracking, streaks and monthly consistency." },
];

function LandingPage() {
  const { user, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("MEMBER");
  const [email, setEmail] = useState("rahul@smartgym.in");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: user.role === "ADMIN" ? "/admin" : "/member", replace: true });
  }, [ready, user, navigate]);

  function switchRole(next: Role) {
    setRole(next);
    setEmail(next === "ADMIN" ? "admin@smartgym.in" : "rahul@smartgym.in");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const signed = await signIn(email, password, role);
      toast.success(`Welcome back, ${signed.name.split(" ")[0]}`);
      navigate({ to: signed.role === "ADMIN" ? "/admin" : "/member", replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-none">Smart Gym</p>
              <p className="mt-1 text-xs text-sidebar-foreground/60">Management & Fitness Tracking</p>
            </div>
          </div>

          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
              Run the gym.
              <br />
              <span className="text-accent">Track every rep.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-sidebar-foreground/70">
              One platform for gym owners and members — memberships, payments and attendance on one side, workouts,
              nutrition and progress on the other.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {highlights.map((h) => (
                <div key={h.title} className="rounded-xl bg-sidebar-accent/40 p-4">
                  <h.icon className="size-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">{h.title}</p>
                  <p className="mt-1 text-xs text-sidebar-foreground/60">{h.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-8 text-sm">
            <div>
              <p className="font-display text-2xl font-semibold">250+</p>
              <p className="text-xs text-sidebar-foreground/60">Active members</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">₹1.25L</p>
              <p className="text-xs text-sidebar-foreground/60">Monthly revenue</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">92%</p>
              <p className="text-xs text-sidebar-foreground/60">Retention</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <Card className="w-full max-w-md shadow-[var(--shadow-card)]">
            <CardContent className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Dumbbell className="size-5" />
                </div>
                <p className="font-display text-lg font-semibold">Smart Gym</p>
              </div>

              <h2 className="font-display text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose a role to explore the demo workspace.</p>

              <Tabs value={role} onValueChange={(v) => switchRole(v as Role)} className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="MEMBER">
                    <User className="mr-2 size-4" /> Member
                  </TabsTrigger>
                  <TabsTrigger value="ADMIN">
                    <ShieldCheck className="mr-2 size-4" /> Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Continue as {role === "ADMIN" ? "Admin" : "Member"}
                </Button>
              </form>

              <p className="mt-5 text-center text-xs text-muted-foreground">
                Demo build — any credentials work. Data is mocked and ready to swap for a REST API.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
