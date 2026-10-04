import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  Apple,
  CalendarCheck,
  Dumbbell,
  Pencil,
  Save,
  X,
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

import { nutritionTargets } from "@/lib/mock-data";

export const Route = createFileRoute("/member/")({
  head: () => ({
    meta: [
      {
        title: "My Dashboard — Smart Gym",
      },
      {
        name: "description",
        content:
          "Your workout, progress and membership dashboard.",
      },
      {
        property: "og:title",
        content: "My Dashboard — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "Your workout, progress and membership dashboard.",
      },
    ],
  }),

  component: MemberHome,
});

/* ========================================================================= */
/* API                                                                       */
/* ========================================================================= */

const PROFILE_API_URL =
  "/api/auth/profile";

const PROGRESS_API_URL =
  "/api/progress";

const WORKOUT_API_URL =
  "/api/workouts";

const TOKEN_KEY = "smartgym.token";

/* ========================================================================= */
/* Types                                                                     */
/* ========================================================================= */

type MemberProfile = {
  id: string;

  membershipPlan: string;

  membershipStartDate: string;

  membershipExpiryDate: string;

  paymentMethod?: string;

  amountPaid?: number;

  phone?: string;

  gender?: string;

  address?: string;

  height?: number;

  weight?: number;

  /*
   * Original weight when the member
   * was registered.
   */
  startingWeight?: number;

  primaryGoal?: string;

  experienceLevel?: string;
};

type ProfileResponse = {
  success: boolean;

  user: {
    id: string;

    name: string;

    email: string;

    role: string;

    member: MemberProfile | null;
  };
};

type ProgressRecord = {
  _id: string;

  userId: string;

  date: string;

  weight: number;

  chest?: number;

  waist?: number;

  arms?: number;

  thighs?: number;

  createdAt?: string;
};

type ProgressResponse = {
  success: boolean;

  progress: ProgressRecord[];
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

  rest: number;

  sets: WorkoutSet[];
};

type Workout = {
  _id: string;

  userId: string;

  date: string;

  exercises: WorkoutExercise[];

  createdAt?: string;

  updatedAt?: string;
};

type WorkoutResponse = {
  success: boolean;

  workouts: Workout[];
};

type WeeklySplit = {
  day: string;

  focus: string;
};

/* ========================================================================= */
/* Default weekly split                                                      */
/* ========================================================================= */

const DEFAULT_WEEKLY_SPLIT: WeeklySplit[] = [
  {
    day: "Monday",
    focus: "Chest + Triceps",
  },

  {
    day: "Tuesday",
    focus: "Back + Biceps",
  },

  {
    day: "Wednesday",
    focus: "Legs",
  },

  {
    day: "Thursday",
    focus: "Shoulders + Abs",
  },

  {
    day: "Friday",
    focus: "Full Body Strength",
  },

  {
    day: "Saturday",
    focus: "Cardio + Core",
  },

  {
    day: "Sunday",
    focus: "Rest & Recovery",
  },
];

/* ========================================================================= */
/* Helper functions                                                          */
/* ========================================================================= */

function formatDate(dateString: string) {
  if (!dateString) {
    return "—";
  }

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return "—";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getDayName(dateString: string) {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return "";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
    }
  );
}

function getMembershipDaysRemaining(
  expiryDateString?: string
) {
  if (!expiryDateString) {
    return 0;
  }

  const today = new Date();

  const expiry = new Date(
    expiryDateString
  );

  if (Number.isNaN(expiry.getTime())) {
    return 0;
  }

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const expiryStart = new Date(
    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate()
  );

  const difference =
    expiryStart.getTime() -
    todayStart.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

function formatWeightChange(
  change: number
) {
  const rounded = Number(
    change.toFixed(1)
  );

  return rounded;
}

/* ========================================================================= */
/* Workout History Card                                                      */
/* ========================================================================= */

function WorkoutHistoryCard({
  workout,
  expanded,
  onToggle,
}: {
  workout: Workout;

  expanded: boolean;

  onToggle: () => void;
}) {
  const totalSets =
    workout.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.length,
      0
    );

  const totalExercises =
    workout.exercises.length;

  const workoutDay = getDayName(
    workout.date
  );

  return (
    <div className="overflow-hidden rounded-xl border">

      {/* Workout header */}

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-secondary/40 px-4 py-4 text-left transition-colors hover:bg-secondary/70"
      >
        <div>
          <p className="text-sm font-semibold">
            {workoutDay} ·{" "}
            {formatDate(workout.date)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {totalExercises} exercises ·{" "}
            {totalSets} total sets
          </p>
        </div>

        <span className="ml-4 text-xl leading-none text-muted-foreground">
          {expanded ? "⌃" : "›"}
        </span>
      </button>

      {/* Expanded workout */}

      {expanded && (
        <div className="border-t px-4 py-4">

          <div className="mb-4 flex items-center justify-between gap-4">

            <div>
              <p className="text-sm font-semibold">
                Workout details
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {totalExercises} exercises ·{" "}
                {totalSets} total sets
              </p>
            </div>

            <Badge variant="secondary">
              {formatDate(workout.date)}
            </Badge>

          </div>

          <div className="space-y-2">

            {workout.exercises.map(
              (exercise) => {

                const completedSets =
                  exercise.sets.filter(
                    (set) =>
                      set.completed
                  ).length;

                const totalReps =
                  exercise.sets.reduce(
                    (total, set) =>
                      total + set.reps,
                    0
                  );

                const maxWeight =
                  exercise.sets.reduce(
                    (max, set) =>
                      Math.max(
                        max,
                        set.weight
                      ),
                    0
                  );

                return (
                  <div
                    key={
                      exercise.exerciseId
                    }
                    className="rounded-lg bg-secondary/50 px-3 py-3"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <Dumbbell className="size-4 shrink-0 text-accent" />

                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium">
                            {exercise.name}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {exercise.category}
                          </p>

                        </div>

                      </div>

                      <div className="text-right">

                        <p className="text-sm font-medium">
                          {exercise.sets.length} sets
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {completedSets} completed
                        </p>

                      </div>

                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-xs">

                      <div>

                        <p className="text-muted-foreground">
                          Reps
                        </p>

                        <p className="mt-1 font-medium">
                          {totalReps}
                        </p>

                      </div>

                      <div>

                        <p className="text-muted-foreground">
                          Max weight
                        </p>

                        <p className="mt-1 font-medium">
                          {maxWeight > 0
                            ? `${maxWeight} kg`
                            : "Bodyweight"}
                        </p>

                      </div>

                      <div>

                        <p className="text-muted-foreground">
                          Rest
                        </p>

                        <p className="mt-1 font-medium">
                          {exercise.rest}s
                        </p>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* ========================================================================= */
/* Member Home                                                               */
/* ========================================================================= */

function MemberHome() {

  /* ----------------------------------------------------------------------- */
  /* Member data                                                             */
  /* ----------------------------------------------------------------------- */

  const [member, setMember] =
    useState<MemberProfile | null>(
      null
    );

  const [memberUserId, setMemberUserId] =
    useState<string | null>(null);

  const [memberName, setMemberName] =
    useState("Member");

  const [progress, setProgress] =
    useState<ProgressRecord[]>(
      []
    );

  const [workouts, setWorkouts] =
    useState<Workout[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  /* ----------------------------------------------------------------------- */
  /* Workout history UI                                                      */
  /* ----------------------------------------------------------------------- */

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    expandedWorkout,
    setExpandedWorkout,
  ] = useState<string | null>(
    null
  );

  /* ----------------------------------------------------------------------- */
  /* Weekly split                                                             */
  /* ----------------------------------------------------------------------- */

  const [
    weeklySplit,
    setWeeklySplit,
  ] = useState<WeeklySplit[]>(
    DEFAULT_WEEKLY_SPLIT
  );

  const [
    editingDay,
    setEditingDay,
  ] = useState<string | null>(
    null
  );

  const [
    editFocus,
    setEditFocus,
  ] = useState("");

  /* ----------------------------------------------------------------------- */
  /* Fetch member data                                                       */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);

        setError(null);

        const token =
          localStorage.getItem(
            TOKEN_KEY
          );

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        /* ================================================================ */
        /* Fetch profile                                                    */
        /* ================================================================ */

        const profileResponse =
          await fetch(
            PROFILE_API_URL,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const profileData =
          (await profileResponse.json()) as ProfileResponse;

        if (
          !profileResponse.ok ||
          !profileData.success
        ) {
          throw new Error(
            "Failed to fetch member profile"
          );
        }

        if (
          !profileData.user.member
        ) {
          throw new Error(
            "Member profile not found"
          );
        }

        setMemberName(
          profileData.user.name
        );

        /*
         * Store the actual User ID.
         *
         * This is important because progress
         * and workout records belong to the
         * authenticated User.
         */
        setMemberUserId(
          profileData.user.id
        );

        setMember(
          profileData.user.member
        );

        /* ================================================================ */
        /* Fetch progress                                                   */
        /* ================================================================ */

        const progressResponse =
          await fetch(
            PROGRESS_API_URL,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const progressData =
          (await progressResponse.json()) as ProgressResponse;

        if (
          progressResponse.ok &&
          progressData.success
        ) {
          setProgress(
            progressData.progress
          );
        }

        /* ================================================================ */
        /* Fetch workouts                                                   */
        /* ================================================================ */

        const workoutResponse =
          await fetch(
            WORKOUT_API_URL,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const workoutData =
          (await workoutResponse.json()) as WorkoutResponse;

        if (
          workoutResponse.ok &&
          workoutData.success
        ) {

          const sortedWorkouts =
            [...workoutData.workouts].sort(
              (a, b) =>
                new Date(
                  b.date
                ).getTime() -
                new Date(
                  a.date
                ).getTime()
            );

          setWorkouts(
            sortedWorkouts
          );
        }

        /* ================================================================ */
        /* Load weekly split                                                */
        /* ================================================================ */

        /*
         * IMPORTANT:
         *
         * Use User ID here.
         *
         * The old code loaded using:
         *
         * profileData.user.id
         *
         * but saved using:
         *
         * member.id
         *
         * Those are different IDs.
         *
         * Now both load and save use
         * the authenticated User ID.
         */

        const splitStorageKey =
          `smartgym.weeklySplit.${profileData.user.id}`;

        const savedSplit =
          localStorage.getItem(
            splitStorageKey
          );

        if (savedSplit) {

          try {

            const parsed =
              JSON.parse(
                savedSplit
              ) as WeeklySplit[];

            if (
              Array.isArray(
                parsed
              )
            ) {
              setWeeklySplit(
                parsed
              );
            }

          } catch {

            setWeeklySplit(
              DEFAULT_WEEKLY_SPLIT
            );
          }
        }

      } catch (error) {

        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );

      } finally {

        setLoading(false);

      }
    }

    loadDashboard();

  }, []);

  /* ----------------------------------------------------------------------- */
  /* Weight calculation                                                      */
  /* ----------------------------------------------------------------------- */

  const weightData =
    useMemo(() => {

      /*
       * Starting weight is the weight
       * stored when the member was created.
       *
       * For old members who do not have
       * startingWeight yet, we temporarily
       * fall back to their current profile
       * weight.
       */

      const startingWeight =
        member?.startingWeight ??
        member?.weight ??
        0;

      /*
       * No progress records:
       *
       * Current weight comes directly
       * from the member profile.
       */

      if (
        progress.length === 0
      ) {

        return {
          currentWeight:
            member?.weight ?? 0,

          startingWeight,

          change: 0,
        };
      }

      /*
       * Sort progress records from
       * oldest to newest.
       */

      const sortedProgress =
        [...progress].sort(
          (a, b) =>
            new Date(
              a.date
            ).getTime() -
            new Date(
              b.date
            ).getTime()
        );

      /*
       * Latest progress record is
       * the current weight.
       */

      const latest =
        sortedProgress[
          sortedProgress.length - 1
        ];

      if (!latest) {

        return {
          currentWeight:
            member?.weight ?? 0,

          startingWeight,

          change: 0,
        };
      }

      /*
       * IMPORTANT:
       *
       * Weight change is calculated
       * from startingWeight.
       *
       * Example:
       *
       * Registered: 60 kg
       * Progress:   61 kg
       * Progress:   63 kg
       *
       * Change = 63 - 60
       *        = +3 kg
       */

      const change =
        latest.weight -
        startingWeight;

      return {
        currentWeight:
          latest.weight,

        startingWeight,

        change,
      };

    }, [
      progress,
      member,
    ]);

  /* ----------------------------------------------------------------------- */
  /* Recent workouts                                                         */
  /* ----------------------------------------------------------------------- */

  const recentWorkouts =
    workouts.slice(0, 3);

  /* ----------------------------------------------------------------------- */
  /* Selected workout                                                        */
  /* ----------------------------------------------------------------------- */

  const selectedWorkout =
    selectedDate
      ? workouts.find(
          (workout) =>
            workout.date ===
            selectedDate
        )
      : null;

  const selectedWorkoutIsRecent =
    selectedWorkout
      ? recentWorkouts.some(
          (workout) =>
            workout._id ===
            selectedWorkout._id
        )
      : false;

  /* ----------------------------------------------------------------------- */
  /* Weekly split editing                                                    */
  /* ----------------------------------------------------------------------- */

  function startEditingDay(
    day: WeeklySplit
  ) {

    setEditingDay(
      day.day
    );

    setEditFocus(
      day.focus
    );
  }

  function cancelEditing() {

    setEditingDay(
      null
    );

    setEditFocus("");
  }

  function saveDay(
    dayName: string
  ) {

    const updatedSplit =
      weeklySplit.map(
        (day) =>
          day.day === dayName
            ? {
                ...day,
                focus:
                  editFocus.trim() ||
                  "Rest",
              }
            : day
      );

    setWeeklySplit(
      updatedSplit
    );

    /*
     * Save weekly split using
     * the authenticated User ID.
     *
     * This keeps each member's
     * weekly split separate.
     */

    if (memberUserId) {

      const splitStorageKey =
        `smartgym.weeklySplit.${memberUserId}`;

      localStorage.setItem(
        splitStorageKey,
        JSON.stringify(
          updatedSplit
        )
      );
    }

    setEditingDay(
      null
    );

    setEditFocus("");
  }

  /* ----------------------------------------------------------------------- */
  /* Loading                                                                  */
  /* ----------------------------------------------------------------------- */

  if (loading) {

    return (
      <>
        <PageHeader
          title="My Dashboard"
          description="Loading your dashboard..."
        />

        <div className="py-12 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* Error                                                                    */
  /* ----------------------------------------------------------------------- */

  if (error) {

    return (
      <>
        <PageHeader
          title="My Dashboard"
          description="Unable to load dashboard"
        />

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">

          <p className="text-sm font-medium">
            {error}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Please make sure you are logged in
            and the backend server is running.
          </p>

        </div>
      </>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* Membership                                                               */
  /* ----------------------------------------------------------------------- */

  const membershipDays =
    member
      ? getMembershipDaysRemaining(
          member.membershipExpiryDate
        )
      : 0;

  /* ----------------------------------------------------------------------- */
  /* Weight change                                                            */
  /* ----------------------------------------------------------------------- */

  const formattedWeightChange =
    formatWeightChange(
      weightData.change
    );

  const weightChangeText =
    formattedWeightChange > 0
      ? `+${formattedWeightChange} kg gained`
      : formattedWeightChange < 0
        ? `${Math.abs(
            formattedWeightChange
          )} kg lost`
        : "No change yet";

  /* ----------------------------------------------------------------------- */
  /* Render                                                                   */
  /* ----------------------------------------------------------------------- */

  return (
    <>
      <PageHeader
        title={`Welcome back, ${memberName} 👋`}
        description="Your fitness progress and membership overview"
      />

      {/* =================================================================== */}
      {/* SUMMARY CARDS                                                       */}
      {/* =================================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Current weight */}

        <StatCard
          label="Current weight"
          value={`${weightData.currentWeight} kg`}
          icon={Dumbbell}
          tone="accent"
          delta={
            weightData.startingWeight > 0
              ? `Started at ${weightData.startingWeight} kg`
              : "No previous record"
          }
        />

        {/* Weight change */}

        <StatCard
          label="Weight change"
          value={weightChangeText}
          icon={Dumbbell}
          tone={
            weightData.change >= 0
              ? "success"
              : "warning"
          }
          delta={
            progress.length > 0
              ? `${progress.length} progress record${
                  progress.length === 1
                    ? ""
                    : "s"
                }`
              : "Add progress records"
          }
        />

        {/* Membership */}

        <StatCard
          label="Membership"
          value={
            member?.membershipPlan ??
            "—"
          }
          icon={CalendarCheck}
          tone="info"
          delta={`${membershipDays} days left`}
        />

        {/* Fee paid */}

        <StatCard
          label="Fee paid"
          value={`₹${member?.amountPaid ?? 0}`}
          icon={Apple}
          tone="success"
          delta={
            member?.paymentMethod
              ? member.paymentMethod
              : "Payment information"
          }
        />

      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">

        {/* ================================================================= */}
        {/* NUTRITION                                                         */}
        {/* ================================================================= */}

        <Card>

          <CardHeader>

            <CardTitle className="text-base">
              Nutrition today
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <MacroBar
              label="Calories"
              value={1780}
              target={
                nutritionTargets.calories
              }
              unit="kcal"
            />

            <MacroBar
              label="Protein"
              value={96}
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

        {/* ================================================================= */}
        {/* WORKOUT HISTORY                                                   */}
        {/* ================================================================= */}

        <Card className="lg:col-span-2">

          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">

            <div>

              <CardTitle className="text-base">
                Workout history
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Your real workout history
              </p>

            </div>

            {/* Date picker */}

            <div className="flex items-center gap-2">

              <CalendarCheck className="size-4 text-muted-foreground" />

              <input
                type="date"
                value={
                  selectedDate
                }
                onChange={(e) => {

                  setSelectedDate(
                    e.target.value
                  );

                  setExpandedWorkout(
                    null
                  );

                }}
                className="h-9 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />

            </div>

          </CardHeader>

          <CardContent className="space-y-3">

            {/* Recent workouts */}

            {recentWorkouts.length >
            0 ? (

              recentWorkouts.map(
                (workout) => (

                  <WorkoutHistoryCard
                    key={
                      workout._id
                    }
                    workout={
                      workout
                    }
                    expanded={
                      expandedWorkout ===
                      workout._id
                    }
                    onToggle={() =>
                      setExpandedWorkout(
                        expandedWorkout ===
                          workout._id
                          ? null
                          : workout._id
                      )
                    }
                  />

                )
              )

            ) : (

              <div className="rounded-xl border border-dashed px-6 py-8 text-center">

                <Dumbbell className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No workout history
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your completed workouts
                  will appear here.
                </p>

              </div>

            )}

            {/* Selected older workout */}

            {selectedDate &&
              selectedWorkout &&
              !selectedWorkoutIsRecent && (

                <div className="mt-5 border-t pt-5">

                  <div className="mb-3">

                    <p className="text-sm font-semibold">
                      Selected date
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(
                        selectedDate
                      )}
                    </p>

                  </div>

                  <WorkoutHistoryCard
                    workout={
                      selectedWorkout
                    }
                    expanded={true}
                    onToggle={() =>
                      setExpandedWorkout(
                        null
                      )
                    }
                  />

                </div>

              )}

            {/* Selected date with no workout */}

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
                    {formatDate(
                      selectedDate
                    )}
                    .
                  </p>

                </div>

              )}

          </CardContent>

        </Card>

        {/* ================================================================= */}
        {/* WEEKLY SPLIT                                                      */}
        {/* ================================================================= */}

        <Card className="lg:col-span-3">

          <CardHeader>

            <div className="flex items-center justify-between">

              <div>

                <CardTitle className="text-base">
                  Weekly split
                </CardTitle>

                <p className="mt-1 text-xs text-muted-foreground">
                  Edit your workout focus for each day.
                </p>

              </div>

            </div>

          </CardHeader>

          <CardContent className="space-y-2">

            {weeklySplit.map(
              (day) => {

                const isEditing =
                  editingDay ===
                  day.day;

                return (
                  <div
                    key={day.day}
                    className="rounded-lg border bg-secondary/20 px-3 py-3"
                  >

                    {!isEditing ? (

                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                          <span className="w-20 text-sm font-medium">
                            {day.day}
                          </span>

                          <span className="text-sm text-muted-foreground">
                            {day.focus}
                          </span>

                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            startEditingDay(
                              day
                            )
                          }
                        >

                          <Pencil className="mr-2 size-4" />

                          Edit

                        </Button>

                      </div>

                    ) : (

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                        <span className="w-20 text-sm font-medium">
                          {day.day}
                        </span>

                        <input
                          type="text"
                          value={
                            editFocus
                          }
                          onChange={(e) =>
                            setEditFocus(
                              e.target.value
                            )
                          }
                          placeholder="Enter workout focus"
                          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                          autoFocus
                        />

                        <div className="flex gap-2">

                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              saveDay(
                                day.day
                              )
                            }
                          >

                            <Save className="mr-2 size-4" />

                            Save

                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={
                              cancelEditing
                            }
                          >

                            <X className="mr-2 size-4" />

                            Cancel

                          </Button>

                        </div>

                      </div>

                    )}

                  </div>
                );
              }
            )}

          </CardContent>

        </Card>

      </div>
    </>
  );
}