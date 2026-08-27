import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusBadge } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { exerciseCategories, exercises } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/exercises")({
  head: () => ({
    meta: [
      { title: "Exercise Library — Smart Gym Admin" },
      { name: "description", content: "Curate the gym exercise library with targets, equipment and difficulty." },
      { property: "og:title", content: "Exercise Library — Smart Gym Admin" },
      { property: "og:description", content: "Curate the gym exercise library used by member workouts." },
    ],
  }),
  component: AdminExercises,
});

function AdminExercises() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          (category === "all" || e.category === category) && e.name.toLowerCase().includes(query.toLowerCase().trim()),
      ),
    [query, category],
  );

  return (
    <>
      <PageHeader
        title="Exercise library"
        description={`${exercises.length} exercises across ${exerciseCategories.length} categories`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> Add exercise
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add exercise</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  toast.success("Exercise added to the library");
                }}
              >
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required placeholder="Barbell Row" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select defaultValue="Back">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseCategories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select defaultValue="Intermediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea rows={3} placeholder="One step per line" />
                </div>
                <Button type="submit" className="w-full">
                  Save exercise
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {exerciseCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No exercises found" description="Try a different search or category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <Card key={e.id} className="transition-shadow hover:shadow-[var(--shadow-lift)]">
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
                <ol className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {e.instructions.slice(0, 3).map((step, i) => (
                    <li key={i}>
                      {i + 1}. {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
