import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, PageHeader, StatusBadge } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exerciseCategories, exercises } from "@/lib/mock-data";
import type { Exercise } from "@/lib/types";

export const Route = createFileRoute("/member/exercises")({
  head: () => ({
    meta: [
      { title: "Exercise Library — Smart Gym" },
      { name: "description", content: "Browse exercises by muscle group with sets, reps, equipment and step-by-step form cues." },
      { property: "og:title", content: "Exercise Library — Smart Gym" },
      { property: "og:description", content: "Exercises by muscle group with form instructions." },
    ],
  }),
  component: MemberExercises,
});

function MemberExercises() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          (category === "all" || e.category === category) &&
          (difficulty === "all" || e.difficulty === difficulty) &&
          e.name.toLowerCase().includes(query.toLowerCase().trim()),
      ),
    [query, category, difficulty],
  );

  return (
    <>
      <PageHeader title="Exercise library" description="Pick an exercise to see step-by-step form cues" />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All muscles</SelectItem>
            {exerciseCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No exercises found" description="Adjust your filters and try again." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <button key={e.id} onClick={() => setSelected(e)} className="text-left">
              <Card className="h-full transition-shadow hover:shadow-[var(--shadow-lift)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-semibold">{e.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {e.target} · {e.equipment}
                      </p>
                    </div>
                    <StatusBadge status={e.difficulty} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{e.category}</Badge>
                    <Badge variant="secondary">
                      {e.sets} × {e.reps}
                    </Badge>
                    <Badge variant="secondary">{e.rest}s rest</Badge>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{selected.category}</Badge>
                  <Badge variant="secondary">{selected.target}</Badge>
                  <Badge variant="secondary">{selected.equipment}</Badge>
                  <StatusBadge status={selected.difficulty} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-secondary py-3">
                    <p className="font-display text-lg font-semibold">{selected.sets}</p>
                    <p className="text-xs text-muted-foreground">Sets</p>
                  </div>
                  <div className="rounded-lg bg-secondary py-3">
                    <p className="font-display text-lg font-semibold">{selected.reps}</p>
                    <p className="text-xs text-muted-foreground">Reps</p>
                  </div>
                  <div className="rounded-lg bg-secondary py-3">
                    <p className="font-display text-lg font-semibold">{selected.rest}s</p>
                    <p className="text-xs text-muted-foreground">Rest</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">How to perform</p>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {selected.instructions.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-medium text-foreground">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
