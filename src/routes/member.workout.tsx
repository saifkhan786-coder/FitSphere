import { createFileRoute } from "@tanstack/react-router";
import { Check, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { todaysWorkout } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/member/workout")({
  head: () => ({
    meta: [
      { title: "Workout Timer — Smart Gym" },
      { name: "description", content: "Run today's workout with a live set timer, rest countdown and set tracking." },
      { property: "og:title", content: "Workout Timer — Smart Gym" },
      { property: "og:description", content: "Live set timer and rest countdown for today's session." },
    ],
  }),
  component: WorkoutPage,
});

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function WorkoutPage() {
  const list = todaysWorkout.exercises;
  const totalSets = list.reduce((s, e) => s + e.sets, 0);

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [rest, setRest] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [done, setDone] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setElapsed((e) => e + 1);
      setRest((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const current = list[exIdx]!;

  function completeSet() {
    setDone((d) => d + 1);
    setRest(current.rest);
    if (setIdx + 1 < current.sets) {
      setSetIdx((s) => s + 1);
    } else if (exIdx + 1 < list.length) {
      setExIdx((i) => i + 1);
      setSetIdx(0);
    } else {
      setRunning(false);
      toast.success("Workout complete! 💪 +120 XP");
    }
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    setRest(0);
    setExIdx(0);
    setSetIdx(0);
    setDone(0);
  }

  return (
    <>
      <PageHeader title={todaysWorkout.title} description={`${list.length} exercises · ${todaysWorkout.duration} min planned`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col items-center p-8">
            <Badge variant="secondary" className="mb-4">
              {rest > 0 ? "Rest" : "Work"}
            </Badge>
            <p className="font-display text-6xl font-semibold tabular-nums tracking-tight md:text-7xl">
              {rest > 0 ? fmt(rest) : fmt(elapsed)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {current.name} · Set {setIdx + 1} of {current.sets} · {current.reps} reps
              {current.weight > 0 ? ` @ ${current.weight} kg` : ""}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button size="lg" onClick={() => setRunning((r) => !r)}>
                {running ? <Pause className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
                {running ? "Pause" : "Start"}
              </Button>
              <Button size="lg" variant="outline" onClick={completeSet}>
                <Check className="mr-2 size-4" /> Complete set
              </Button>
              <Button size="lg" variant="outline" onClick={() => setRest(0)} disabled={rest === 0}>
                <SkipForward className="mr-2 size-4" /> Skip rest
              </Button>
              <Button size="lg" variant="ghost" onClick={reset}>
                <RotateCcw className="mr-2 size-4" /> Reset
              </Button>
            </div>

            <div className="mt-8 w-full">
              <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                <span>Session progress</span>
                <span>
                  {done} / {totalSets} sets
                </span>
              </div>
              <Progress value={(done / totalSets) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {list.map((e, i) => (
              <div
                key={e.exerciseId}
                className={cn(
                  "rounded-lg border px-4 py-3 transition-colors",
                  i === exIdx ? "border-accent bg-accent/10" : "border-border",
                  i < exIdx && "opacity-60",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{e.name}</p>
                  {i < exIdx && <Check className="size-4 text-success" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {e.sets} × {e.reps} {e.weight > 0 ? `· ${e.weight} kg` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
