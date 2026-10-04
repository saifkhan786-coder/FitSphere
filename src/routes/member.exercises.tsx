import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Dumbbell,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/common/ui-kit";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

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

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute(
  "/member/exercises"
)({
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
        content:
          "Exercise Library — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "Exercises by muscle group with form instructions.",
      },
    ],
  }),

  component: MemberExercises,
});

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Exercise = {
  _id: string;
  name: string;
  category: string;
  difficulty: string;
  instructions: string;
  createdAt?: string;
  updatedAt?: string;
};

type WorkoutSet = {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
};

type WorkoutExercise = {
  exerciseId: string;
  name: string;
  category: string;
  sets: WorkoutSet[];
  rest: number;
};

type StoredWorkout = {
  date: string;
  exercises: WorkoutExercise[];
};

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

const API_URL =
  "/api/exercises";

const WORKOUT_API_URL =
  "/api/workouts";

const TOKEN_KEY =
  "smartgym.token";

const AUTH_STORAGE_KEY =
  "smartgym.auth";

/* -------------------------------------------------------------------------- */
/* Get current logged-in user                                                 */
/* -------------------------------------------------------------------------- */

function getCurrentUserId(): string | null {
  const raw =
    localStorage.getItem(
      AUTH_STORAGE_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    const user = JSON.parse(raw);

    if (!user?.id) {
      return null;
    }

    return String(user.id);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Member-specific workout storage key                                        */
/* -------------------------------------------------------------------------- */

function getWorkoutStorageKey(): string | null {
  const userId =
    getCurrentUserId();

  if (!userId) {
    return null;
  }

  return `smartgym.todayWorkout:${userId}`;
}

/* -------------------------------------------------------------------------- */
/* Today's date                                                               */
/* -------------------------------------------------------------------------- */

function getTodayDate(): string {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* -------------------------------------------------------------------------- */
/* Create default workout exercise                                            */
/* -------------------------------------------------------------------------- */

function createWorkoutExercise(
  exercise: Exercise
): WorkoutExercise {
  return {
    exerciseId: exercise._id,

    name: exercise.name,

    category: exercise.category,

    rest: 60,

    sets: [
      {
        id: crypto.randomUUID(),
        reps: 10,
        weight: 0,
        completed: false,
      },
      {
        id: crypto.randomUUID(),
        reps: 10,
        weight: 0,
        completed: false,
      },
      {
        id: crypto.randomUUID(),
        reps: 10,
        weight: 0,
        completed: false,
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Read today's workout                                                       */
/* -------------------------------------------------------------------------- */

function readTodaysWorkout(): WorkoutExercise[] {
  try {
    const storageKey =
      getWorkoutStorageKey();

    if (!storageKey) {
      return [];
    }

    const saved =
      localStorage.getItem(
        storageKey
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved) as StoredWorkout;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.date !== getTodayDate() ||
      !Array.isArray(parsed.exercises)
    ) {
      return [];
    }

    return parsed.exercises;
  } catch (error) {
    console.error(
      "Failed to read today's workout:",
      error
    );

    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Save today's workout locally                                               */
/* -------------------------------------------------------------------------- */

function saveTodaysWorkout(
  exercises: WorkoutExercise[]
): void {
  const storageKey =
    getWorkoutStorageKey();

  if (!storageKey) {
    console.warn(
      "Cannot save workout: user ID not found."
    );

    return;
  }

  const workout: StoredWorkout = {
    date: getTodayDate(),
    exercises,
  };

  localStorage.setItem(
    storageKey,
    JSON.stringify(workout)
  );
}

/* -------------------------------------------------------------------------- */
/* Get authentication token                                                   */
/* -------------------------------------------------------------------------- */

function getToken(): string | null {
  return localStorage.getItem(
    TOKEN_KEY
  );
}

/* -------------------------------------------------------------------------- */
/* Save today's workout to MongoDB                                            */
/* -------------------------------------------------------------------------- */

async function saveWorkoutToServer(
  exercises: WorkoutExercise[]
) {
  const token =
    getToken();

  if (!token) {
    throw new Error(
      "Authentication token not found"
    );
  }

  const response =
    await fetch(
      WORKOUT_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          date: getTodayDate(),
          exercises,
        }),
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.message ||
        "Failed to save workout"
    );
  }

  return data.workout;
}

/* -------------------------------------------------------------------------- */
/* Member Exercises                                                           */
/* -------------------------------------------------------------------------- */

function MemberExercises() {
  const [query, setQuery] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [difficulty, setDifficulty] =
    useState("all");

  const [selected, setSelected] =
    useState<Exercise | null>(null);

  const [exercises, setExercises] =
    useState<Exercise[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    workoutExercises,
    setWorkoutExercises,
  ] = useState<WorkoutExercise[]>([]);

  /* ---------------------------------------------------------------------- */
  /* Load today's workout                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const workout =
      readTodaysWorkout();

    setWorkoutExercises(
      workout
    );
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Fetch exercises                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function fetchExercises() {
      try {
        setLoading(true);

        const response =
          await fetch(API_URL);

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to fetch exercises"
          );
        }

        setExercises(
          data.exercises ?? []
        );
      } catch (error) {
        console.error(
          "Exercise fetch error:",
          error
        );

        toast.error(
          "Failed to load exercises"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Categories                                                             */
  /* ---------------------------------------------------------------------- */

  const exerciseCategories =
    useMemo(() => {
      return Array.from(
        new Set(
          exercises.map(
            (exercise) =>
              exercise.category
          )
        )
      );
    }, [exercises]);

  /* ---------------------------------------------------------------------- */
  /* Filter exercises                                                       */
  /* ---------------------------------------------------------------------- */

  const filtered =
    useMemo(() => {
      return exercises.filter(
        (exercise) =>
          (category === "all" ||
            exercise.category ===
              category) &&
          (difficulty === "all" ||
            exercise.difficulty ===
              difficulty) &&
          exercise.name
            .toLowerCase()
            .includes(
              query
                .toLowerCase()
                .trim()
            )
      );
    }, [
      exercises,
      query,
      category,
      difficulty,
    ]);

  /* ---------------------------------------------------------------------- */
  /* Check if exercise is already added                                     */
  /* ---------------------------------------------------------------------- */

  function isExerciseAdded(
    exerciseId: string
  ) {
    return workoutExercises.some(
      (exercise) =>
        exercise.exerciseId ===
        exerciseId
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Add exercise to today's workout                                        */
  /* ---------------------------------------------------------------------- */

  async function addToWorkout(
    exercise: Exercise
  ) {
    try {
      const currentWorkout =
        readTodaysWorkout();

      const alreadyAdded =
        currentWorkout.some(
          (item) =>
            item.exerciseId ===
            exercise._id
        );

      if (alreadyAdded) {
        toast.info(
          `${exercise.name} is already in today's workout`
        );

        return;
      }

      const newWorkoutExercise =
        createWorkoutExercise(
          exercise
        );

      const updatedWorkout = [
        ...currentWorkout,
        newWorkoutExercise,
      ];

      saveTodaysWorkout(
        updatedWorkout
      );

      setWorkoutExercises(
        updatedWorkout
      );

      try {
        await saveWorkoutToServer(
          updatedWorkout
        );

        toast.success(
          `${exercise.name} added to today's workout`
        );
      } catch (serverError) {
        console.error(
          "Workout server save error:",
          serverError
        );

        toast.warning(
          `${exercise.name} added locally, but server sync failed`
        );
      }

      setSelected(null);

      window.location.href =
        "/member/workout";
    } catch (error) {
      console.error(
        "Add workout error:",
        error
      );

      toast.error(
        "Failed to add exercise to workout"
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* JSX                                                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <PageHeader
        title="Exercise library"
        description="Pick an exercise to see step-by-step form cues"
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search exercises"
            className="pl-9"
          />
        </div>

        <Select
          value={category}
          onValueChange={
            setCategory
          }
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
                  key={
                    exerciseCategory
                  }
                  value={
                    exerciseCategory
                  }
                >
                  {exerciseCategory}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Select
          value={difficulty}
          onValueChange={
            setDifficulty
          }
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(
            (exercise) => {
              const added =
                isExerciseAdded(
                  exercise._id
                );

              return (
                <button
                  type="button"
                  key={
                    exercise._id
                  }
                  onClick={() =>
                    setSelected(
                      exercise
                    )
                  }
                  className="text-left"
                >
                  <Card className="h-full transition-shadow hover:shadow-[var(--shadow-lift)]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-semibold">
                            {
                              exercise.name
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {
                              exercise.category
                            }
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            exercise.difficulty
                          }
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">
                          {
                            exercise.category
                          }
                        </Badge>

                        <Badge variant="secondary">
                          {
                            exercise.difficulty
                          }
                        </Badge>
                      </div>

                      {added && (
                        <div className="mt-3">
                          <Badge>
                            <Check className="mr-1 size-3" />
                            Added Today
                          </Badge>
                        </div>
                      )}

                      <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                        {
                          exercise.instructions
                        }
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            }
          )}
        </div>
      )}

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
                  {
                    selected.name
                  }
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">
                    {
                      selected.category
                    }
                  </Badge>

                  <StatusBadge
                    status={
                      selected.difficulty
                    }
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">
                    How to perform
                  </p>

                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {selected.instructions
                      .split("\n")
                      .filter(
                        (step) =>
                          step.trim() !==
                          ""
                      )
                      .map(
                        (
                          step,
                          index
                        ) => (
                          <li
                            key={
                              index
                            }
                            className="flex gap-2"
                          >
                            <span className="font-medium text-foreground">
                              {
                                index +
                                1
                              }.
                            </span>

                            <span>
                              {step.trim()}
                            </span>
                          </li>
                        )
                      )}
                  </ol>
                </div>

                <div className="border-t pt-4">
                  <Button
                    className="w-full"
                    onClick={() =>
                      addToWorkout(
                        selected
                      )
                    }
                    disabled={isExerciseAdded(
                      selected._id
                    )}
                  >
                    {isExerciseAdded(
                      selected._id
                    ) ? (
                      <>
                        <Check className="mr-2 size-4" />
                        Already Added Today
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 size-4" />
                        Add to Today's Workout
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}