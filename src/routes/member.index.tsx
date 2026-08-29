import { Link, createFileRoute } from "@tanstack/react-router";
import { Apple, CalendarCheck, Dumbbell, Flame, Trophy } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MacroBar, PageHeader, StatCard } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { achievements, nutritionTargets, todaysWorkout, weightProgress, weeklySplit } from "@/lib/mock-data";

export const Route = createFileRoute("/member/")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Smart Gym" },
      { name: "description", content: "Today's workout, calories, macros, progress and membership status at a glance." },
      { property: "og:title", content: "My Dashboard — Smart Gym" },
      { property: "og:description", content: "Your workout, nutrition and progress snapshot." },
    ],
  }),
  component: MemberHome,
});

function MemberHome() {
  const consumed = 1780;
  const protein = 96;
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <>
      <PageHeader title="Welcome back, Rahul 👋" description="Monday · Chest + Triceps day" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current weight" value="58 kg" icon={Dumbbell} tone="accent" delta="+3 kg since April" />
        <StatCard label="Calories today" value={`${consumed} kcal`} icon={Flame} tone="warning" delta={`Target ${nutritionTargets.calories}`} />
        <StatCard label="Protein today" value={`${protein} g`} icon={Apple} tone="success" delta={`Target ${nutritionTargets.protein} g`} />
        <StatCard label="Membership" value="42 days left" icon={CalendarCheck} tone="info" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Today's workout · {todaysWorkout.title}</CardTitle>
            <Badge variant="secondary">{todaysWorkout.duration} min</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysWorkout.exercises.map((e) => (
              <div key={e.exerciseId} className="flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.sets} sets × {e.reps} reps {e.weight > 0 ? `· ${e.weight} kg` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{e.rest}s rest</span>
              </div>
            ))}
            <Button asChild className="w-full">
              <Link to="/member/workout">Start workout</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nutrition today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MacroBar label="Calories" value={consumed} target={nutritionTargets.calories} unit="kcal" />
            <MacroBar label="Protein" value={protein} target={nutritionTargets.protein} unit="g" colorVar="--color-chart-2" />
            <MacroBar label="Carbs" value={215} target={nutritionTargets.carbs} unit="g" colorVar="--color-chart-3" />
            <MacroBar label="Fat" value={52} target={nutritionTargets.fat} unit="g" colorVar="--color-chart-4" />
            <Button asChild variant="outline" className="w-full">
              <Link to="/member/nutrition">Log a meal</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weight progress</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightProgress} margin={{ left: -16 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[50, 62]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={2} fill="url(#wGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly split</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weeklySplit.map((d) => (
                <div key={d.day} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{d.day.slice(0, 3)}</span>
                  <span className="font-medium">{d.focus}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Achievements</CardTitle>
              <Trophy className="size-4 text-accent" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={(unlocked.length / achievements.length) * 100} />
              <p className="text-xs text-muted-foreground">
                {unlocked.length} of {achievements.length} unlocked · {unlocked.reduce((s, a) => s + a.xp, 0)} XP
              </p>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <span
                    key={a.id}
                    title={a.title}
                    className={`flex size-10 items-center justify-center rounded-xl bg-secondary text-lg ${a.unlocked ? "" : "opacity-30 grayscale"}`}
                  >
                    {a.icon}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
