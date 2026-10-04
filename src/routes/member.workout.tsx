import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/ui-kit";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute(
  "/member/workout"
)({
  head: () => ({
    meta: [
      {
        title: "Today's Workout — Smart Gym",
      },
      {
        name: "description",
        content:
          "Build your workout, record reps and weight, and track your session.",
      },
      {
        property: "og:title",
        content:
          "Today's Workout — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "Build and record today's workout.",
      },
    ],
  }),

  component: WorkoutPage,
});

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

type StoredAuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

/* -------------------------------------------------------------------------- */
/* Storage / API                                                              */
/* -------------------------------------------------------------------------- */

const WORKOUT_STORAGE_KEY =
  "smartgym.todayWorkout";

const AUTH_STORAGE_KEY =
  "smartgym.auth";

const TOKEN_KEY =
  "smartgym.token";

const API_URL =
  "/api/workouts";

/* -------------------------------------------------------------------------- */
/* Get current logged-in user ID                                              */
/* -------------------------------------------------------------------------- */

function getCurrentUserId(): string | null {
  try {
    const savedUser =
      localStorage.getItem(
        AUTH_STORAGE_KEY
      );

    if (!savedUser) {
      return null;
    }

    const user =
      JSON.parse(
        savedUser
      ) as StoredAuthUser;

    if (
      !user ||
      !user.id
    ) {
      return null;
    }

    return String(user.id);
  } catch (error) {
    console.error(
      "Failed to read current user:",
      error
    );

    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Get user-specific workout storage key                                      */
/* -------------------------------------------------------------------------- */

function getWorkoutStorageKey(): string | null {
  const userId =
    getCurrentUserId();

  if (!userId) {
    return null;
  }

  return `${WORKOUT_STORAGE_KEY}:${userId}`;
}

/*
 * Example:
 *
 * Member A:
 * smartgym.todayWorkout:68abc123
 *
 * Member B:
 * smartgym.todayWorkout:68xyz456
 *
 * Therefore their local workouts are separated.
 */

/* -------------------------------------------------------------------------- */
/* Today's date                                                               */
/* -------------------------------------------------------------------------- */

function getTodayDate(): string {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* -------------------------------------------------------------------------- */
/* Timer formatter                                                            */
/* -------------------------------------------------------------------------- */

function fmt(sec: number): string {
  const minutes =
    Math.floor(sec / 60);

  const seconds =
    sec % 60;

  return `${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Normalize workout                                                          */
/* -------------------------------------------------------------------------- */

function normalizeWorkout(
  data: unknown
): WorkoutExercise[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(
      (exercise) =>
        exercise &&
        typeof exercise === "object"
    )
    .map((exercise: any) => {
      const sets: WorkoutSet[] =
        Array.isArray(
          exercise.sets
        )
          ? exercise.sets.map(
              (
                set: any
              ): WorkoutSet => ({
                id:
                  typeof set.id ===
                  "string"
                    ? set.id
                    : crypto.randomUUID(),

                reps:
                  typeof set.reps ===
                  "number"
                    ? set.reps
                    : 10,

                weight:
                  typeof set.weight ===
                  "number"
                    ? set.weight
                    : 0,

                completed:
                  set.completed === true,
              })
            )
          : [];

      if (sets.length === 0) {
        sets.push({
          id: crypto.randomUUID(),
          reps: 10,
          weight: 0,
          completed: false,
        });
      }

      return {
        exerciseId: String(
          exercise.exerciseId ?? ""
        ),

        name: String(
          exercise.name ??
            "Exercise"
        ),

        category: String(
          exercise.category ??
            ""
        ),

        rest:
          typeof exercise.rest ===
          "number"
            ? exercise.rest
            : 60,

        sets,
      };
    })
    .filter(
      (exercise) =>
        exercise.exerciseId !== ""
    );
}

/* -------------------------------------------------------------------------- */
/* Read today's workout from localStorage                                     */
/* -------------------------------------------------------------------------- */

function readTodaysWorkout(): WorkoutExercise[] {
  try {
    const storageKey =
      getWorkoutStorageKey();

    /*
     * If there is no logged-in user,
     * never use a shared workout key.
     */
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

    const parsed: unknown =
      JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return [];
    }

    const workout =
      parsed as Partial<StoredWorkout>;

    if (
      workout.date !==
      getTodayDate()
    ) {
      localStorage.removeItem(
        storageKey
      );

      return [];
    }

    if (
      !Array.isArray(
        workout.exercises
      )
    ) {
      return [];
    }

    return normalizeWorkout(
      workout.exercises
    );
  } catch (error) {
    console.error(
      "Failed to read today's workout:",
      error
    );

    const storageKey =
      getWorkoutStorageKey();

    if (storageKey) {
      localStorage.removeItem(
        storageKey
      );
    }

    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Save today's workout to localStorage                                       */
/* -------------------------------------------------------------------------- */

function saveTodaysWorkout(
  exercises: WorkoutExercise[]
): void {
  const storageKey =
    getWorkoutStorageKey();

  /*
   * Never save a workout if we cannot
   * identify the logged-in member.
   */
  if (!storageKey) {
    console.warn(
      "Cannot save workout: no logged-in user found."
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
/* Fetch today's workout from MongoDB                                         */
/* -------------------------------------------------------------------------- */

async function fetchTodaysWorkoutFromServer(): Promise<
  WorkoutExercise[] | null
> {
  const token = getToken();

  if (!token) {
    console.warn(
      "No authentication token found."
    );

    return null;
  }

  try {
    const response = await fetch(
      API_URL,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch workout"
      );
    }

    if (
      !data.success ||
      !Array.isArray(
        data.workouts
      )
    ) {
      return null;
    }

    const today =
      getTodayDate();

    const todaysWorkout =
      data.workouts.find(
        (workout: any) =>
          workout.date === today
      );

    /*
     * Important:
     *
     * MongoDB successfully responded,
     * but this member has no workout today.
     *
     * Return [] instead of null.
     *
     * This lets the frontend clear stale
     * localStorage data.
     */
    if (!todaysWorkout) {
      return [];
    }

    return normalizeWorkout(
      todaysWorkout.exercises
    );
  } catch (error) {
    console.error(
      "Failed to fetch workout from server:",
      error
    );

    /*
     * null means the server request failed.
     *
     * [] means the server successfully
     * confirmed that there is no workout.
     */
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Save workout to MongoDB                                                    */
/* -------------------------------------------------------------------------- */

async function saveWorkoutToServer(
  exercises: WorkoutExercise[]
): Promise<boolean> {
  const token = getToken();

  if (!token) {
    console.warn(
      "No authentication token found."
    );

    return false;
  }

  try {
    const response = await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          date: getTodayDate(),
          exercises,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to save workout"
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Failed to save workout to server:",
      error
    );

    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Workout Page                                                               */
/* -------------------------------------------------------------------------- */

function WorkoutPage() {
  /* ---------------------------------------------------------------------- */
  /* Workout list                                                           */
  /* ---------------------------------------------------------------------- */

  const [list, setList] =
    useState<WorkoutExercise[]>(
      []
    );

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                */
  /* ---------------------------------------------------------------------- */

  const [loaded, setLoaded] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Current exercise                                                       */
  /* ---------------------------------------------------------------------- */

  const [exIdx, setExIdx] =
    useState(0);

  const [setIdx, setSetIdx] =
    useState(0);

  /* ---------------------------------------------------------------------- */
  /* Expanded exercise                                                      */
  /* ---------------------------------------------------------------------- */

  const [
    expandedExerciseId,
    setExpandedExerciseId,
  ] =
    useState<string | null>(
      null
    );

  /* ---------------------------------------------------------------------- */
  /* Timer                                                                  */
  /* ---------------------------------------------------------------------- */

  const [elapsed, setElapsed] =
    useState(0);

  const [running, setRunning] =
    useState(false);

  const [rest, setRest] =
    useState(0);

  const timer =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  /* ---------------------------------------------------------------------- */
  /* Load today's workout                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadWorkout() {
      /*
       * First read this member's
       * own localStorage.
       */
      const localWorkout =
        readTodaysWorkout();

      if (!cancelled) {
        setList(localWorkout);

        if (
          localWorkout.length > 0
        ) {
          setExpandedExerciseId(
            localWorkout[0]
              ?.exerciseId ??
              null
          );
        }
      }

      /*
       * Then load the current member's
       * workout from MongoDB.
       *
       * The backend identifies the member
       * using the JWT token.
       */
      const serverWorkout =
        await fetchTodaysWorkoutFromServer();

      if (cancelled) {
        return;
      }

      /*
       * null means server request failed.
       *
       * In that case we keep the local
       * workout because it may still be
       * useful offline.
       */
      if (
        serverWorkout !== null
      ) {
        setList(
          serverWorkout
        );

        if (
          serverWorkout.length > 0
        ) {
          setExpandedExerciseId(
            serverWorkout[0]
              ?.exerciseId ??
              null
          );
        } else {
          setExpandedExerciseId(
            null
          );
        }

        /*
         * Synchronize this member's
         * own localStorage with MongoDB.
         */
        saveTodaysWorkout(
          serverWorkout
        );
      }

      setLoaded(true);
    }

    loadWorkout();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Automatically save changes                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!loaded) {
      return;
    }

    /*
     * Save this member's workout
     * locally immediately.
     */
    try {
      saveTodaysWorkout(
        list
      );
    } catch (error) {
      console.error(
        "Failed to automatically save workout:",
        error
      );
    }

    /*
     * Debounce MongoDB save.
     *
     * This prevents an API request for
     * every single keystroke.
     */
    const timeout =
      window.setTimeout(() => {
        saveWorkoutToServer(
          list
        );
      }, 700);

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [list, loaded]);

  /* ---------------------------------------------------------------------- */
  /* Listen for storage changes                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    function handleStorageChange(
      event: StorageEvent
    ) {
      const currentStorageKey =
        getWorkoutStorageKey();

      /*
       * Only respond to changes belonging
       * to the currently logged-in member.
       */
      if (
        !currentStorageKey ||
        event.key !==
          currentStorageKey
      ) {
        return;
      }

      const todaysWorkout =
        readTodaysWorkout();

      setList(
        todaysWorkout
      );

      setExIdx(0);
      setSetIdx(0);

      if (
        todaysWorkout.length > 0
      ) {
        setExpandedExerciseId(
          todaysWorkout[0]
            ?.exerciseId ??
            null
        );
      } else {
        setExpandedExerciseId(
          null
        );
      }
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Timer                                                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!running) {
      if (timer.current) {
        clearInterval(
          timer.current
        );

        timer.current = null;
      }

      return;
    }

    timer.current =
      setInterval(() => {
        setElapsed(
          (previous) =>
            previous + 1
        );

        setRest(
          (previous) =>
            previous > 0
              ? previous - 1
              : 0
        );
      }, 1000);

    return () => {
      if (timer.current) {
        clearInterval(
          timer.current
        );

        timer.current = null;
      }
    };
  }, [running]);

  /* ---------------------------------------------------------------------- */
  /* Current exercise                                                       */
  /* ---------------------------------------------------------------------- */

  const current =
    list[exIdx] ?? null;

  /* ---------------------------------------------------------------------- */
  /* Total sets                                                             */
  /* ---------------------------------------------------------------------- */

  const totalSets =
    useMemo(() => {
      return list.reduce(
        (
          total,
          exercise
        ) =>
          total +
          exercise.sets.length,
        0
      );
    }, [list]);

  /* ---------------------------------------------------------------------- */
  /* Completed sets                                                         */
  /* ---------------------------------------------------------------------- */

  const completedSets =
    useMemo(() => {
      return list.reduce(
        (
          total,
          exercise
        ) =>
          total +
          exercise.sets.filter(
            (set) =>
              set.completed
          ).length,
        0
      );
    }, [list]);

  /* ---------------------------------------------------------------------- */
  /* Progress                                                               */
  /* ---------------------------------------------------------------------- */

  const progress =
    totalSets > 0
      ? (completedSets /
          totalSets) *
        100
      : 0;

  /* ---------------------------------------------------------------------- */
  /* Expand / collapse exercise                                             */
  /* ---------------------------------------------------------------------- */

  function toggleExercise(
    exerciseIndex: number
  ) {
    const exercise =
      list[exerciseIndex];

    if (!exercise) {
      return;
    }

    if (
      expandedExerciseId ===
      exercise.exerciseId
    ) {
      setExpandedExerciseId(
        null
      );

      return;
    }

    setExpandedExerciseId(
      exercise.exerciseId
    );

    setExIdx(
      exerciseIndex
    );

    const firstIncomplete =
      exercise.sets.findIndex(
        (set) =>
          !set.completed
      );

    setSetIdx(
      firstIncomplete >= 0
        ? firstIncomplete
        : 0
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Update reps / weight                                                   */
  /* ---------------------------------------------------------------------- */

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field:
      | "reps"
      | "weight",
    value: number
  ) {
    setList(
      (previous) =>
        previous.map(
          (
            exercise,
            index
          ) => {
            if (
              index !==
              exerciseIndex
            ) {
              return exercise;
            }

            return {
              ...exercise,

              sets:
                exercise.sets.map(
                  (
                    set,
                    currentSetIndex
                  ) => {
                    if (
                      currentSetIndex !==
                      setIndex
                    ) {
                      return set;
                    }

                    return {
                      ...set,
                      [field]:
                        value,
                    };
                  }
                ),
            };
          }
        )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Add set                                                                */
  /* ---------------------------------------------------------------------- */

  function addSet(
    exerciseIndex: number
  ) {
    setList(
      (previous) =>
        previous.map(
          (
            exercise,
            index
          ) => {
            if (
              index !==
              exerciseIndex
            ) {
              return exercise;
            }

            const lastSet =
              exercise.sets[
                exercise.sets.length -
                  1
              ];

            return {
              ...exercise,

              sets: [
                ...exercise.sets,

                {
                  id: crypto.randomUUID(),

                  reps:
                    lastSet?.reps ??
                    10,

                  weight:
                    lastSet?.weight ??
                    0,

                  completed:
                    false,
                },
              ],
            };
          }
        )
    );

    toast.success(
      "Set added"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Remove set                                                             */
  /* ---------------------------------------------------------------------- */

  function removeSet(
    exerciseIndex: number,
    setIndex: number
  ) {
    const exercise =
      list[exerciseIndex];

    if (!exercise) {
      return;
    }

    if (
      exercise.sets.length <=
      1
    ) {
      toast.error(
        "An exercise must have at least one set"
      );

      return;
    }

    setList(
      (previous) =>
        previous.map(
          (
            item,
            index
          ) => {
            if (
              index !==
              exerciseIndex
            ) {
              return item;
            }

            return {
              ...item,

              sets:
                item.sets.filter(
                  (_, index) =>
                    index !==
                    setIndex
                ),
            };
          }
        )
    );

    if (
      exerciseIndex ===
      exIdx
    ) {
      setSetIdx(
        (previous) => {
          if (
            previous >
            setIndex
          ) {
            return (
              previous - 1
            );
          }

          return Math.min(
            previous,
            exercise.sets.length -
              2
          );
        }
      );
    }

    toast.success(
      "Set removed"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Remove exercise                                                        */
  /* ---------------------------------------------------------------------- */

  function removeExercise(
    exerciseIndex: number
  ) {
    const exercise =
      list[exerciseIndex];

    if (!exercise) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${exercise.name} from today's workout?`
      );

    if (!confirmed) {
      return;
    }

    const newList =
      list.filter(
        (_, index) =>
          index !==
          exerciseIndex
      );

    setList(
      newList
    );

    if (
      expandedExerciseId ===
      exercise.exerciseId
    ) {
      setExpandedExerciseId(
        null
      );
    }

    setExIdx(
      (previous) => {
        if (
          newList.length ===
          0
        ) {
          return 0;
        }

        if (
          previous >
          exerciseIndex
        ) {
          return (
            previous - 1
          );
        }

        if (
          previous >=
          newList.length
        ) {
          return (
            newList.length - 1
          );
        }

        return previous;
      }
    );

    setSetIdx(0);

    toast.success(
      `${exercise.name} removed`
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Complete current set                                                   */
  /* ---------------------------------------------------------------------- */

  function completeSet() {
    if (!current) {
      return;
    }

    const selectedSet =
      current.sets[setIdx];

    if (!selectedSet) {
      return;
    }

    if (
      selectedSet.reps <= 0
    ) {
      toast.error(
        "Enter reps before completing the set"
      );

      return;
    }

    if (
      selectedSet.completed
    ) {
      toast.info(
        "This set is already completed"
      );

      return;
    }

    setList(
      (previous) =>
        previous.map(
          (
            exercise,
            index
          ) => {
            if (
              index !==
              exIdx
            ) {
              return exercise;
            }

            return {
              ...exercise,

              sets:
                exercise.sets.map(
                  (
                    set,
                    index
                  ) => {
                    if (
                      index !==
                      setIdx
                    ) {
                      return set;
                    }

                    return {
                      ...set,
                      completed:
                        true,
                    };
                  }
                ),
            };
          }
        )
    );

    setRest(
      current.rest
    );

    if (
      setIdx + 1 <
      current.sets.length
    ) {
      setSetIdx(
        (previous) =>
          previous + 1
      );

      return;
    }

    if (
      exIdx + 1 <
      list.length
    ) {
      const nextExerciseIndex =
        exIdx + 1;

      const nextExercise =
        list[
          nextExerciseIndex
        ];

      setExIdx(
        nextExerciseIndex
      );

      setSetIdx(0);

      if (nextExercise) {
        setExpandedExerciseId(
          nextExercise.exerciseId
        );
      }

      return;
    }

    setRunning(false);

    toast.success(
      "Workout completed! 💪"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Reset workout progress                                                 */
  /* ---------------------------------------------------------------------- */

  function resetWorkout() {
    const confirmed =
      window.confirm(
        "Reset today's workout progress?"
      );

    if (!confirmed) {
      return;
    }

    setRunning(false);

    setElapsed(0);

    setRest(0);

    setExIdx(0);

    setSetIdx(0);

    if (
      list.length > 0
    ) {
      setExpandedExerciseId(
        list[0]?.exerciseId ??
          null
      );
    } else {
      setExpandedExerciseId(
        null
      );
    }

    setList(
      (previous) =>
        previous.map(
          (exercise) => ({
            ...exercise,

            sets:
              exercise.sets.map(
                (set) => ({
                  ...set,
                  completed:
                    false,
                })
              ),
          })
        )
    );

    toast.success(
      "Workout progress reset"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Manual save                                                            */
  /* ---------------------------------------------------------------------- */

  async function saveWorkout() {
    try {
      /*
       * Save this member's workout locally.
       */
      saveTodaysWorkout(
        list
      );

      /*
       * Save this member's workout
       * to MongoDB.
       */
      const success =
        await saveWorkoutToServer(
          list
        );

      if (success) {
        toast.success(
          "Today's workout saved successfully"
        );
      } else {
        toast.error(
          "Workout saved locally, but MongoDB sync failed"
        );
      }
    } catch (error) {
      console.error(
        "Save workout error:",
        error
      );

      toast.error(
        "Failed to save workout"
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Go to Exercise Library                                                 */
  /* ---------------------------------------------------------------------- */

  function goToExerciseLibrary() {
    window.location.href =
      "/member/exercises";
  }

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                */
  /* ---------------------------------------------------------------------- */

  if (!loaded) {
    return (
      <>
        <PageHeader
          title="Today's Workout"
          description="Loading your workout..."
        />

        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Loading workout...
          </CardContent>
        </Card>
      </>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Empty workout                                                          */
  /* ---------------------------------------------------------------------- */

  if (list.length === 0) {
    return (
      <>
        <PageHeader
          title="Today's Workout"
          description="Add exercises from the Exercise Library to start your workout."
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <Plus className="size-7" />
            </div>

            <p className="text-base font-semibold">
              No exercises added
            </p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Open the Exercise
              Library and add
              exercises to today's
              workout.
            </p>

            <Button
              className="mt-5"
              onClick={
                goToExerciseLibrary
              }
            >
              <Plus className="mr-2 size-4" />
              Browse Exercise Library
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Main UI                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <PageHeader
        title="Today's Workout"
        description={`${list.length} exercises · ${totalSets} total sets`}
      />

      <div className="space-y-4">

        {/* ================================================================ */}
        {/* TOP ACTIONS                                                       */}
        {/* ================================================================ */}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={
              goToExerciseLibrary
            }
          >
            <Plus className="mr-2 size-4" />
            Add Exercise
          </Button>

          <Button
            onClick={
              saveWorkout
            }
          >
            <Save className="mr-2 size-4" />
            Save Workout
          </Button>
        </div>

        {/* ================================================================ */}
        {/* TIMER                                                             */}
        {/* ================================================================ */}

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">

              <Badge
                variant={
                  rest > 0
                    ? "default"
                    : "secondary"
                }
                className="mb-3"
              >
                {rest > 0
                  ? "Rest"
                  : "Workout"}
              </Badge>

              <p className="font-display text-5xl font-semibold tabular-nums md:text-6xl">
                {rest > 0
                  ? fmt(rest)
                  : fmt(elapsed)}
              </p>

              {current && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {current.name}
                  {" · "}
                  Set{" "}
                  {setIdx + 1}
                  {" of "}
                  {
                    current.sets
                      .length
                  }
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-2">

                <Button
                  size="lg"
                  onClick={() =>
                    setRunning(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {running ? (
                    <Pause className="mr-2 size-4" />
                  ) : (
                    <Play className="mr-2 size-4" />
                  )}

                  {running
                    ? "Pause"
                    : "Start"}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={
                    completeSet
                  }
                  disabled={
                    !current
                  }
                >
                  <Check className="mr-2 size-4" />
                  Complete Set
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  disabled={
                    rest === 0
                  }
                  onClick={() =>
                    setRest(0)
                  }
                >
                  <Clock className="mr-2 size-4" />
                  Skip Rest
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={
                    resetWorkout
                  }
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>

              </div>

              {/* Progress */}

              <div className="mt-6 w-full max-w-xl">
                <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>
                    Workout progress
                  </span>

                  <span>
                    {
                      completedSets
                    }{" "}
                    /{" "}
                    {totalSets} sets
                  </span>
                </div>

                <Progress
                  value={
                    progress
                  }
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* EXERCISES                                                         */}
        {/* ================================================================ */}

        <div className="space-y-3">

          {list.map(
            (
              exercise,
              exerciseIndex
            ) => {

              const isCurrent =
                exerciseIndex ===
                exIdx;

              const isExpanded =
                expandedExerciseId ===
                exercise.exerciseId;

              const exerciseCompleted =
                exercise.sets.length >
                  0 &&
                exercise.sets.every(
                  (set) =>
                    set.completed
                );

              const completedExerciseSets =
                exercise.sets.filter(
                  (set) =>
                    set.completed
                ).length;

              return (
                <Card
                  key={
                    exercise.exerciseId
                  }
                  className={cn(
                    "overflow-hidden transition-all",

                    isCurrent &&
                      "border-accent",

                    isExpanded &&
                      "shadow-sm"
                  )}
                >

                  {/* ------------------------------------------------------ */}
                  {/* Clickable Exercise Header                              */}
                  {/* ------------------------------------------------------ */}

                  <CardHeader className="p-0">

                    <div className="flex items-center">

                      {/* Main clickable area */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleExercise(
                            exerciseIndex
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 p-5 text-left transition-colors hover:bg-muted/50"
                      >

                        {/* Exercise icon */}

                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg",

                            exerciseCompleted
                              ? "bg-secondary"
                              : "bg-accent/10"
                          )}
                        >
                          {exerciseCompleted ? (
                            <Check className="size-5" />
                          ) : (
                            <span className="text-sm font-bold">
                              {exerciseIndex +
                                1}
                            </span>
                          )}
                        </div>

                        {/* Exercise information */}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            <CardTitle className="truncate text-base">
                              {
                                exercise.name
                              }
                            </CardTitle>

                            {isCurrent && (
                              <Badge
                                variant="secondary"
                                className="hidden sm:inline-flex"
                              >
                                Current
                              </Badge>
                            )}

                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {
                              exercise.category
                            }
                            {" · "}
                            {
                              completedExerciseSets
                            }
                            /
                            {
                              exercise.sets
                                .length
                            }{" "}
                            sets completed
                          </p>

                        </div>

                        {/* Expand icon */}

                        <div className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="size-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="size-5 text-muted-foreground" />
                          )}
                        </div>

                      </button>

                      {/* Remove button */}

                      <div className="pr-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            removeExercise(
                              exerciseIndex
                            )
                          }
                          title="Remove exercise"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                    </div>

                  </CardHeader>

                  {/* ------------------------------------------------------ */}
                  {/* Expanded Exercise Content                              */}
                  {/* ------------------------------------------------------ */}

                  {isExpanded && (
                    <CardContent className="border-t bg-muted/20 p-4 sm:p-5">

                      {/* Exercise summary */}

                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                        <div className="flex flex-wrap gap-2">

                          <Badge variant="outline">
                            {
                              exercise.category
                            }
                          </Badge>

                          <Badge variant="outline">
                            {
                              exercise.sets
                                .length
                            }{" "}
                            sets
                          </Badge>

                          <Badge variant="outline">
                            Rest{" "}
                            {
                              exercise.rest
                            }s
                          </Badge>

                        </div>

                        {isCurrent && (
                          <Badge>
                            Current Exercise
                          </Badge>
                        )}

                      </div>

                      {/* -------------------------------------------------- */}
                      {/* Sets                                                 */}
                      {/* -------------------------------------------------- */}

                      <div className="space-y-3">

                        {exercise.sets.map(
                          (
                            set,
                            setIndex
                          ) => {

                            const selected =
                              exerciseIndex ===
                                exIdx &&
                              setIndex ===
                                setIdx;

                            return (
                              <div
                                key={
                                  set.id
                                }
                                className={cn(
                                  "rounded-xl border bg-background p-3 transition-all",

                                  selected &&
                                    "border-primary ring-1 ring-primary/20",

                                  set.completed &&
                                    "bg-secondary/40"
                                )}
                              >

                                {/* Set top row */}

                                <div className="flex items-center justify-between gap-3">

                                  <div className="flex items-center gap-2">

                                    <div
                                      className={cn(
                                        "flex size-8 items-center justify-center rounded-full text-xs font-semibold",

                                        set.completed
                                          ? "bg-primary text-primary-foreground"
                                          : selected
                                            ? "bg-accent text-accent-foreground"
                                            : "bg-muted"
                                      )}
                                    >
                                      {set.completed ? (
                                        <Check className="size-4" />
                                      ) : (
                                        setIndex +
                                        1
                                      )}
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold">
                                        Set{" "}
                                        {
                                          setIndex +
                                          1
                                        }
                                      </p>

                                      <p className="text-xs text-muted-foreground">
                                        {set.completed
                                          ? "Completed"
                                          : selected
                                            ? "Current set"
                                            : "Not completed"}
                                      </p>
                                    </div>

                                  </div>

                                  {!set.completed && (
                                    <Button
                                      size="sm"
                                      variant={
                                        selected
                                          ? "default"
                                          : "outline"
                                      }
                                      onClick={() => {
                                        setExIdx(
                                          exerciseIndex
                                        );

                                        setSetIdx(
                                          setIndex
                                        );
                                      }}
                                    >
                                      {selected
                                        ? "Selected"
                                        : "Select"}
                                    </Button>
                                  )}

                                  {set.completed && (
                                    <Badge>
                                      <Check className="mr-1 size-3" />
                                      Done
                                    </Badge>
                                  )}

                                </div>

                                {/* Inputs */}

                                <div className="mt-3 grid grid-cols-2 gap-3">

                                  <div>
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                      Reps
                                    </label>

                                    <Input
                                      type="number"
                                      min="0"
                                      value={
                                        set.reps
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateSet(
                                          exerciseIndex,
                                          setIndex,
                                          "reps",
                                          Number(
                                            event
                                              .target
                                              .value
                                          )
                                        )
                                      }
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                      Weight (kg)
                                    </label>

                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={
                                        set.weight
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateSet(
                                          exerciseIndex,
                                          setIndex,
                                          "weight",
                                          Number(
                                            event
                                              .target
                                              .value
                                          )
                                        )
                                      }
                                    />
                                  </div>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                      {/* -------------------------------------------------- */}
                      {/* Set Controls                                         */}
                      {/* -------------------------------------------------- */}

                      <div className="mt-4 flex flex-wrap gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            addSet(
                              exerciseIndex
                            )
                          }
                        >
                          <Plus className="mr-2 size-4" />
                          Add Set
                        </Button>

                        {exercise.sets.length >
                          1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              removeSet(
                                exerciseIndex,
                                exercise
                                  .sets
                                  .length -
                                  1
                              )
                            }
                          >
                            <Minus className="mr-2 size-4" />
                            Remove Last Set
                          </Button>
                        )}

                        <Button
                          size="sm"
                          className="ml-auto"
                          onClick={() => {
                            setExIdx(
                              exerciseIndex
                            );

                            const nextSet =
                              exercise.sets.findIndex(
                                (set) =>
                                  !set.completed
                              );

                            setSetIdx(
                              nextSet >=
                                0
                                ? nextSet
                                : 0
                            );

                            if (
                              nextSet >=
                              0
                            ) {
                              toast.info(
                                `Set ${nextSet + 1} selected`
                              );
                            }
                          }}
                        >
                          <Check className="mr-2 size-4" />
                          Select Exercise
                        </Button>

                      </div>

                      {/* -------------------------------------------------- */}
                      {/* Complete Current Set                                */}
                      {/* -------------------------------------------------- */}

                      {isCurrent && (
                        <div className="mt-4 rounded-xl border bg-background p-4">

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                              <p className="text-sm font-semibold">
                                {current?.sets[
                                  setIdx
                                ]?.completed
                                  ? "Set completed"
                                  : `Ready for Set ${
                                      setIdx +
                                      1
                                    }`}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Enter your reps
                                and weight,
                                then complete
                                the set.
                              </p>
                            </div>

                            <Button
                              size="lg"
                              onClick={
                                completeSet
                              }
                              disabled={
                                !current ||
                                current
                                  .sets[
                                  setIdx
                                ]
                                  ?.completed
                              }
                            >
                              <Check className="mr-2 size-4" />
                              Complete Set
                            </Button>

                          </div>

                        </div>
                      )}

                    </CardContent>
                  )}

                </Card>
              );
            }
          )}

        </div>

        {/* ================================================================ */}
        {/* BOTTOM SAVE                                                       */}
        {/* ================================================================ */}

        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold">
                Today's workout
              </p>

              <p className="text-xs text-muted-foreground">
                {
                  completedSets
                }{" "}
                of{" "}
                {totalSets} sets
                completed.
              </p>
            </div>

            <Button
              onClick={
                saveWorkout
              }
            >
              <Save className="mr-2 size-4" />
              Save Workout
            </Button>

          </CardContent>
        </Card>

      </div>
    </>
  );
}