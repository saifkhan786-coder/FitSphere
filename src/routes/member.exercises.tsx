import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/common/ui-kit";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/member/exercises")({
  head: () => ({
    meta: [
      {
        title: "Exercise Library — Smart Gym",
      },
      {
        name: "description",
        content:
          "Browse exercises by muscle group with difficulty and step-by-step instructions.",
      },
      {
        property: "og:title",
        content: "Exercise Library — Smart Gym",
      },
      {
        property: "og:description",
        content: "Exercises by muscle group with form instructions.",
      },
    ],
  }),
  component: MemberExercises,
});

type Exercise = {
  _id: string;
  name: string;
  category: string;
  difficulty: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
};

function MemberExercises() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const [selected, setSelected] =
    useState<Exercise | null>(null);

  const [exercises, setExercises] =
    useState<Exercise[]>([]);

  const [loading, setLoading] = useState(true);

  /*
   * Fetch exercises from backend
   */
  const fetchExercises = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://192.168.37.238:5000/api/exercises"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch exercises"
        );
      }

      setExercises(data.exercises);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Load exercises when page opens
   */
  useEffect(() => {
    fetchExercises();
  }, []);

  /*
   * Create category list from backend exercises
   */
  const exerciseCategories = useMemo(() => {
    return Array.from(
      new Set(
        exercises.map(
          (exercise) => exercise.category
        )
      )
    );
  }, [exercises]);

  /*
   * Filter exercises
   */
  const filtered = useMemo(() => {
    return exercises.filter(
      (exercise) =>
        (category === "all" ||
          exercise.category === category) &&
        (difficulty === "all" ||
          exercise.difficulty === difficulty) &&
        exercise.name
          .toLowerCase()
          .includes(query.toLowerCase().trim())
    );
  }, [
    exercises,
    query,
    category,
    difficulty,
  ]);

  return (
    <>
      <PageHeader
        title="Exercise library"
        description="Pick an exercise to see step-by-step form cues"
      />

      {/* Search and filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search exercises"
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All muscles
            </SelectItem>

            {exerciseCategories.map(
              (exerciseCategory) => (
                <SelectItem
                  key={exerciseCategory}
                  value={exerciseCategory}
                >
                  {exerciseCategory}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {/* Difficulty filter */}
        <Select
          value={difficulty}
          onValueChange={setDifficulty}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All levels
            </SelectItem>

            <SelectItem value="Beginner">
              Beginner
            </SelectItem>

            <SelectItem value="Intermediate">
              Intermediate
            </SelectItem>

            <SelectItem value="Advanced">
              Advanced
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-10 text-center text-muted-foreground">
          Loading exercises...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises found"
          description="Adjust your filters and try again."
        />
      ) : (
        /*
         * Exercise cards
         */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exercise) => (
            <button
              key={exercise._id}
              onClick={() =>
                setSelected(exercise)
              }
              className="text-left"
            >
              <Card className="h-full transition-shadow hover:shadow-[var(--shadow-lift)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-semibold">
                        {exercise.name}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {exercise.category}
                      </p>
                    </div>

                    <StatusBadge
                      status={exercise.difficulty}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">
                      {exercise.category}
                    </Badge>

                    <Badge variant="secondary">
                      {exercise.difficulty}
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                    {exercise.instructions}
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Exercise details dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selected.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Exercise information */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">
                    {selected.category}
                  </Badge>

                  <StatusBadge
                    status={selected.difficulty}
                  />
                </div>

                {/* Instructions */}
                <div>
                  <p className="mb-2 text-sm font-medium">
                    How to perform
                  </p>

                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {selected.instructions
                      .split("\n")
                      .filter(
                        (step) =>
                          step.trim() !== ""
                      )
                      .map((step, index) => (
                        <li
                          key={index}
                          className="flex gap-2"
                        >
                          <span className="font-medium text-foreground">
                            {index + 1}.
                          </span>

                          <span>
                            {step.trim()}
                          </span>
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