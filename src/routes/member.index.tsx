import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  Apple,
  CalendarCheck,
  Dumbbell,
  Flame,
  Trophy,
} from "lucide-react";

import {
  MacroBar,
  PageHeader,
  StatCard,
} from "@/components/common/ui-kit";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import {
  achievements,
  nutritionTargets,
  todaysWorkout,
  weeklySplit,
} from "@/lib/mock-data";

export const Route = createFileRoute("/member/")({
  head: () => ({
    meta: [
      {
        title: "My Dashboard — Smart Gym",
      },
      {
        name: "description",
        content:
          "Today's workout, calories, macros, progress and membership status at a glance.",
      },
      {
        property: "og:title",
        content: "My Dashboard — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "Your workout, nutrition and progress snapshot.",
      },
    ],
  }),

  component: MemberHome,
});

/* -------------------------------------------------------------------------- */
/* Workout History                                                            */
/* -------------------------------------------------------------------------- */

const workoutHistory = [
  {
    id: 1,
    day: "Monday",
    date: "29 Sep 2026",
    dateKey: "2026-09-29",
    title: "Chest + Triceps",
    duration: 45,

    exercises: [
      {
        name: "Bench Press",
        sets: 4,
        reps: 10,
        weight: "40 kg",
      },
      {
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: 10,
        weight: "16 kg",
      },
      {
        name: "Cable Fly",
        sets: 3,
        reps: 12,
        weight: "12 kg",
      },
      {
        name: "Push-ups",
        sets: 3,
        reps: 15,
        weight: "Bodyweight",
      },
    ],
  },

  {
    id: 2,
    day: "Saturday",
    date: "27 Sep 2026",
    dateKey: "2026-09-27",
    title: "Back + Biceps",
    duration: 50,

    exercises: [
      {
        name: "Lat Pulldown",
        sets: 4,
        reps: 10,
        weight: "45 kg",
      },
      {
        name: "Barbell Row",
        sets: 3,
        reps: 10,
        weight: "40 kg",
      },
      {
        name: "Seated Cable Row",
        sets: 3,
        reps: 12,
        weight: "35 kg",
      },
      {
        name: "Dumbbell Curl",
        sets: 3,
        reps: 12,
        weight: "10 kg",
      },
    ],
  },

  {
    id: 3,
    day: "Friday",
    date: "26 Sep 2026",
    dateKey: "2026-09-26",
    title: "Legs",
    duration: 55,

    exercises: [
      {
        name: "Barbell Squat",
        sets: 4,
        reps: 10,
        weight: "60 kg",
      },
      {
        name: "Leg Press",
        sets: 3,
        reps: 12,
        weight: "100 kg",
      },
      {
        name: "Leg Extension",
        sets: 3,
        reps: 12,
        weight: "40 kg",
      },
      {
        name: "Leg Curl",
        sets: 3,
        reps: 12,
        weight: "35 kg",
      },
      {
        name: "Calf Raise",
        sets: 3,
        reps: 15,
        weight: "30 kg",
      },
    ],
  },

  {
    id: 4,
    day: "Thursday",
    date: "25 Sep 2026",
    dateKey: "2026-09-25",
    title: "Shoulders + Abs",
    duration: 45,

    exercises: [
      {
        name: "Shoulder Press",
        sets: 4,
        reps: 10,
        weight: "20 kg",
      },
      {
        name: "Lateral Raise",
        sets: 3,
        reps: 12,
        weight: "8 kg",
      },
      {
        name: "Front Raise",
        sets: 3,
        reps: 12,
        weight: "8 kg",
      },
      {
        name: "Plank",
        sets: 3,
        reps: 60,
        weight: "Bodyweight",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Helper                                                                     */
/* -------------------------------------------------------------------------- */

function formatSelectedDate(dateString: string) {
  if (!dateString) {
    return "Select date";
  }

 const parts = dateString.split("-");

const year = Number(parts[0]);
const month = Number(parts[1]);
const day = Number(parts[2]);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/* Workout Card                                                               */
/* -------------------------------------------------------------------------- */

function WorkoutHistoryCard({
  workout,
  expanded,
  onToggle,
}: {
  workout: (typeof workoutHistory)[number];
  expanded: boolean;
  onToggle: () => void;
}) {
  const totalSets = workout.exercises.reduce(
    (total, exercise) =>
      total + exercise.sets,
    0
  );

  return (
    <div className="overflow-hidden rounded-xl border">

      {/* Workout row */}

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-secondary/40 px-4 py-4 text-left transition-colors hover:bg-secondary/70"
      >
        <div>
          <p className="text-sm font-semibold">
            {workout.day} · {workout.date}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {workout.title} · {workout.duration} min
          </p>
        </div>

        <span className="ml-4 text-xl leading-none text-muted-foreground">
          {expanded ? "⌃" : "›"}
        </span>
      </button>

      {/* Expanded details */}

      {expanded && (
        <div className="border-t px-4 py-4">

          {/* Workout summary */}

          <div className="mb-4 flex items-center justify-between gap-4">

            <div>
              <p className="text-sm font-semibold">
                {workout.title}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {workout.exercises.length} exercises ·{" "}
                {totalSets} total sets
              </p>
            </div>

            <Badge variant="secondary">
              {workout.duration} min
            </Badge>

          </div>

          {/* Exercise list */}

          <div className="space-y-2">

            {workout.exercises.map(
              (exercise) => (
                <div
                  key={exercise.name}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-3"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <Dumbbell className="size-4 shrink-0 text-accent" />

                    <span className="truncate text-sm font-medium">
                      {exercise.name}
                    </span>

                  </div>

                  <div className="ml-4 shrink-0 text-right">

                    <p className="text-sm font-medium">
                      {exercise.sets} ×{" "}
                      {exercise.reps}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {exercise.weight}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

          {/* Summary */}

          <div className="mt-4 flex items-center justify-between border-t pt-3">

            <span className="text-xs text-muted-foreground">
              {workout.exercises.length} exercises
            </span>

            <span className="text-xs font-medium">
              {totalSets} total sets
            </span>

          </div>

        </div>
      )}

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Member Home                                                                */
/* -------------------------------------------------------------------------- */

function MemberHome() {
  const consumed = 1780;
  const protein = 96;

  /*
   * Date selected in the calendar.
   */
  const [selectedDate, setSelectedDate] =
    useState("");

  /*
   * Which recent workout is expanded.
   */
  const [expandedWorkout, setExpandedWorkout] =
    useState<number | null>(null);

  const unlocked = achievements.filter(
    (a) => a.unlocked
  );

  /*
   * For the current mock data:
   *
   * 29 Sep = current/recent day
   * 28 Sep = previous day
   * 27 Sep = two days ago
   *
   * We show the latest three available
   * workout records.
   *
   * When MongoDB is connected, this will
   * simply be the latest 3 workout sessions.
   */
  const recentWorkouts =
    workoutHistory.slice(0, 3);

  /*
   * If the user selects a date,
   * find that workout.
   */
  const selectedWorkout =
    selectedDate
      ? workoutHistory.find(
          (workout) =>
            workout.dateKey === selectedDate
        )
      : null;

  /*
   * Check whether selected date is already
   * one of the recent three records.
   */
  const selectedWorkoutIsRecent =
    selectedWorkout
      ? recentWorkouts.some(
          (workout) =>
            workout.id === selectedWorkout.id
        )
      : false;

  return (
    <>
      <PageHeader
        title="Welcome back, Rahul 👋"
        description="Monday · Chest + Triceps day"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Stats                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Current weight"
          value="58 kg"
          icon={Dumbbell}
          tone="accent"
          delta="+3 kg since April"
        />

        <StatCard
          label="Calories today"
          value={`${consumed} kcal`}
          icon={Flame}
          tone="warning"
          delta={`Target ${nutritionTargets.calories}`}
        />

        <StatCard
          label="Protein today"
          value={`${protein} g`}
          icon={Apple}
          tone="success"
          delta={`Target ${nutritionTargets.protein} g`}
        />

        <StatCard
          label="Membership"
          value="42 days left"
          icon={CalendarCheck}
          tone="info"
        />

      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">

        {/* ---------------------------------------------------------------- */}
        {/* Today's Workout                                                  */}
        {/* ---------------------------------------------------------------- */}

        <Card className="lg:col-span-2">

          <CardHeader className="flex-row items-center justify-between space-y-0">

            <CardTitle className="text-base">
              Today's workout ·{" "}
              {todaysWorkout.title}
            </CardTitle>

            <Badge variant="secondary">
              {todaysWorkout.duration} min
            </Badge>

          </CardHeader>

          <CardContent className="space-y-3">

            {todaysWorkout.exercises.map(
              (e) => (
                <div
                  key={e.exerciseId}
                  className="flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3"
                >

                  <div>

                    <p className="text-sm font-medium">
                      {e.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {e.sets} sets ×{" "}
                      {e.reps} reps{" "}
                      {e.weight > 0
                        ? `· ${e.weight} kg`
                        : ""}
                    </p>

                  </div>

                  <span className="text-xs text-muted-foreground">
                    {e.rest}s rest
                  </span>

                </div>
              )
            )}

            <Button
              asChild
              className="w-full"
            >
              <Link to="/member/workout">
                Start workout
              </Link>
            </Button>

          </CardContent>

        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Nutrition                                                         */}
        {/* ---------------------------------------------------------------- */}

        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              Nutrition today
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <MacroBar
              label="Calories"
              value={consumed}
              target={
                nutritionTargets.calories
              }
              unit="kcal"
            />

            <MacroBar
              label="Protein"
              value={protein}
              target={
                nutritionTargets.protein
              }
              unit="g"
              colorVar="--color-chart-2"
            />

            <MacroBar
              label="Carbs"
              value={215}
              target={
                nutritionTargets.carbs
              }
              unit="g"
              colorVar="--color-chart-3"
            />

            <MacroBar
              label="Fat"
              value={52}
              target={
                nutritionTargets.fat
              }
              unit="g"
              colorVar="--color-chart-4"
            />

            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link to="/member/nutrition">
                Log a meal
              </Link>
            </Button>

          </CardContent>

        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Workout History                                                  */}
        {/* ---------------------------------------------------------------- */}

        <Card className="lg:col-span-2">

          {/* Header */}

          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">

            <div>
              <CardTitle className="text-base">
                Workout history
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Recent workouts
              </p>
            </div>

            {/* Date Picker */}

            <div className="flex items-center gap-2">

              <CalendarCheck className="size-4 text-muted-foreground" />

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(
                    e.target.value
                  );

                  setExpandedWorkout(null);
                }}
                className="h-9 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />

            </div>

          </CardHeader>

          <CardContent className="space-y-3">

            {/* ------------------------------------------------------------ */}
            {/* Recent 3 workouts                                             */}
            {/* ------------------------------------------------------------ */}

            {recentWorkouts.map(
              (workout) => (
                <WorkoutHistoryCard
                  key={workout.id}
                  workout={workout}
                  expanded={
                    expandedWorkout ===
                    workout.id
                  }
                  onToggle={() =>
                    setExpandedWorkout(
                      expandedWorkout ===
                        workout.id
                        ? null
                        : workout.id
                    )
                  }
                />
              )
            )}

            {/* ------------------------------------------------------------ */}
            {/* Selected older date                                           */}
            {/* ------------------------------------------------------------ */}

            {selectedDate &&
              selectedWorkout &&
              !selectedWorkoutIsRecent && (
                <div className="mt-5 border-t pt-5">

                  <div className="mb-3">

                    <p className="text-sm font-semibold">
                      Selected date
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatSelectedDate(
                        selectedDate
                      )}
                    </p>

                  </div>

                  <WorkoutHistoryCard
                    workout={selectedWorkout}
                    expanded={true}
                    onToggle={() =>
                      setExpandedWorkout(null)
                    }
                  />

                </div>
              )}

            {/* ------------------------------------------------------------ */}
            {/* Selected date has no workout                                  */}
            {/* ------------------------------------------------------------ */}

            {selectedDate &&
              !selectedWorkout && (
                <div className="mt-5 rounded-xl border border-dashed px-6 py-8 text-center">

                  <Dumbbell className="mx-auto size-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No workout recorded
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    There is no workout history
                    for{" "}
                    {formatSelectedDate(
                      selectedDate
                    )}
                    .
                  </p>

                </div>
              )}

          </CardContent>

        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Weekly Split                                                     */}
        {/* ---------------------------------------------------------------- */}

        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              Weekly split
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">

            {weeklySplit.map((d) => (
              <div
                key={d.day}
                className="flex items-center justify-between text-sm"
              >

                <span className="text-muted-foreground">
                  {d.day.slice(0, 3)}
                </span>

                <span className="font-medium">
                  {d.focus}
                </span>

              </div>
            ))}

          </CardContent>

        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Achievements                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div className="space-y-4 lg:col-span-3">

          <Card>

            <CardHeader className="flex-row items-center justify-between space-y-0">

              <CardTitle className="text-base">
                Achievements
              </CardTitle>

              <Trophy className="size-4 text-accent" />

            </CardHeader>

            <CardContent className="space-y-3">

              <Progress
                value={
                  (unlocked.length /
                    achievements.length) *
                  100
                }
              />

              <p className="text-xs text-muted-foreground">
                {unlocked.length} of{" "}
                {achievements.length} unlocked ·{" "}
                {unlocked.reduce(
                  (s, a) => s + a.xp,
                  0
                )}{" "}
                XP
              </p>

              <div className="flex flex-wrap gap-2">

                {achievements.map((a) => (
                  <span
                    key={a.id}
                    title={a.title}
                    className={`flex size-10 items-center justify-center rounded-xl bg-secondary text-lg ${
                      a.unlocked
                        ? ""
                        : "opacity-30 grayscale"
                    }`}
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