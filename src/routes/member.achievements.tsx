import { createFileRoute } from "@tanstack/react-router";
import { Flame, Medal, Sparkles, Trophy } from "lucide-react";
import { PageHeader, StatCard } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { achievements, leaderboard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/member/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — Smart Gym" },
      { name: "description", content: "Unlock badges, earn XP, keep your streak and climb the gym leaderboard." },
      { property: "og:title", content: "Achievements — Smart Gym" },
      { property: "og:description", content: "Badges, XP, streaks and the gym leaderboard." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const unlocked = achievements.filter((a) => a.unlocked);
  const xp = unlocked.reduce((s, a) => s + a.xp, 0);
  const nextLevelXp = 1500;

  return (
    <>
      <PageHeader title="Achievements" description="Badges, XP and the gym leaderboard" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total XP" value={xp} icon={Sparkles} tone="accent" />
        <StatCard label="Badges unlocked" value={`${unlocked.length}/${achievements.length}`} icon={Trophy} tone="success" />
        <StatCard label="Current streak" value="7 days" icon={Flame} tone="warning" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Level 4 · Iron</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={(xp / nextLevelXp) * 100} />
          <p className="text-xs text-muted-foreground">
            {nextLevelXp - xp} XP to reach Level 5 · Steel
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {achievements.map((a) => (
            <Card key={a.id} className={cn(!a.unlocked && "opacity-60")}>
              <CardContent className="flex items-start gap-4 p-5">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl",
                    a.unlocked ? "bg-accent/15" : "bg-secondary grayscale",
                  )}
                >
                  {a.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{a.title}</p>
                    <Badge variant="secondary">+{a.xp} XP</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  {!a.unlocked && <p className="mt-2 text-xs text-muted-foreground">Locked</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((row) => (
              <div
                key={row.rank}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5",
                  row.rank === 1 ? "bg-accent/10" : "bg-secondary/60",
                )}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-background text-xs font-semibold">
                  {row.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.xp} XP · {row.streak} day streak
                  </p>
                </div>
                {row.rank <= 3 && <Medal className="size-4 text-accent" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
