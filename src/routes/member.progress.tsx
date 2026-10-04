import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Ruler,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import {
  PageHeader,
  StatCard,
} from "@/components/common/ui-kit";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const Route = createFileRoute(
  "/member/progress"
)({
  head: () => ({
    meta: [
      {
        title: "Progress — Smart Gym",
      },
      {
        name: "description",
        content:
          "Track weight and body measurements over time with charts.",
      },
      {
        property: "og:title",
        content:
          "Progress — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "Weight and body measurement progression charts.",
      },
    ],
  }),

  component: ProgressPage,
});

const PROGRESS_API_URL =
  "/api/progress";

const PROFILE_API_URL =
  "/api/auth/profile";

const TOKEN_KEY =
  "smartgym.token";

const tooltipStyle = {
  background: "var(--color-card)",
  border:
    "1px solid var(--color-border)",
  borderRadius: 12,
} as const;

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
  updatedAt?: string;
};

type MemberProfile = {
  startingWeight?: number;
  weight?: number;
};

function ProgressPage() {
  const [open, setOpen] =
    useState(false);

  const [progress, setProgress] =
    useState<ProgressRecord[]>([]);

  const [startingWeight, setStartingWeight] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [date, setDate] =
    useState("2026-10-03");

  const [weight, setWeight] =
    useState("58");

  const [chest, setChest] =
    useState("38");

  const [waist, setWaist] =
    useState("30");

  const [arms, setArms] =
    useState("12.4");

  const [thighs, setThighs] =
    useState("21.3");

  useEffect(() => {
    fetchProgress();
    fetchProfile();
  }, []);

  async function fetchProgress() {
    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const response =
        await fetch(
          PROGRESS_API_URL,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
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
            "Failed to fetch progress"
        );
      }

      setProgress(
        data.progress ?? []
      );
    } catch (error) {
      console.error(
        "Progress fetch error:",
        error
      );

      toast.error(
        "Failed to load progress"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const response =
        await fetch(
          PROFILE_API_URL,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
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
            "Failed to fetch profile"
        );
      }

      const member:
        MemberProfile | null =
        data.user?.member ?? null;

      if (member) {
        const profileStartingWeight =
          Number(
            member.startingWeight ??
              member.weight ??
              0
          );

        setStartingWeight(
          profileStartingWeight > 0
            ? profileStartingWeight
            : null
        );
      }
    } catch (error) {
      console.error(
        "Profile fetch error:",
        error
      );
    }
  }

  async function handleSaveProgress(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setSaving(true);

      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      if (!date || !weight) {
        toast.error(
          "Date and weight are required"
        );

        return;
      }

      const response =
        await fetch(
          PROGRESS_API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              date,

              weight: Number(
                weight
              ),

              chest:
                chest === ""
                  ? undefined
                  : Number(chest),

              waist:
                waist === ""
                  ? undefined
                  : Number(waist),

              arms:
                arms === ""
                  ? undefined
                  : Number(arms),

              thighs:
                thighs === ""
                  ? undefined
                  : Number(thighs),
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
            "Failed to save progress"
        );
      }

      setProgress(
        (current) => [
          ...current,
          data.progress,
        ].sort((a, b) =>
          a.date.localeCompare(
            b.date
          )
        )
      );

      setOpen(false);

      toast.success(
        "Progress record saved"
      );
    } catch (error) {
      console.error(
        "Progress save error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save progress"
      );
    } finally {
      setSaving(false);
    }
  }

  const first =
    progress.length > 0
      ? progress[0]
      : null;

  const last =
    progress.length > 0
      ? progress[
          progress.length - 1
        ]
      : null;

  /*
   * Weight gained/lost is now calculated
   * using the member's actual starting
   * weight instead of the first progress
   * record.
   *
   * Example:
   *
   * Starting weight = 56 kg
   * Current weight  = 58 kg
   *
   * Weight gained = 58 - 56 = +2 kg
   */
  const weightGained =
    startingWeight !== null && last
      ? last.weight -
        startingWeight
      : 0;

  const waistReduced =
    first?.waist !== undefined &&
    last?.waist !== undefined
      ? first.waist -
        last.waist
      : 0;

  return (
    <>
      <PageHeader
        title="Progress"
        description="Body composition over time"
        action={
          <Dialog
            open={open}
            onOpenChange={
              setOpen
            }
          >
            <DialogTrigger
              asChild
            >
              <Button>
                <Plus className="mr-2 size-4" />
                Add record
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Add progress record
                </DialogTitle>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={
                  handleSaveProgress
                }
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Date
                    </Label>

                    <Input
                      type="date"
                      value={date}
                      onChange={(e) =>
                        setDate(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Weight (kg)
                    </Label>

                    <Input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) =>
                        setWeight(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Chest (in)
                    </Label>

                    <Input
                      type="number"
                      step="0.1"
                      value={chest}
                      onChange={(e) =>
                        setChest(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Waist (in)
                    </Label>

                    <Input
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) =>
                        setWaist(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Arms (in)
                    </Label>

                    <Input
                      type="number"
                      step="0.1"
                      value={arms}
                      onChange={(e) =>
                        setArms(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Thighs (in)
                    </Label>

                    <Input
                      type="number"
                      step="0.1"
                      value={thighs}
                      onChange={(e) =>
                        setThighs(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save record"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading progress...
        </div>
      ) : progress.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No progress records yet.
          Add your first record to
          start tracking your progress.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <StatCard
              label="Weight gained"
              value={`${weightGained >= 0 ? "+" : ""}${weightGained.toFixed(1)} kg`}
              icon={TrendingUp}
              tone="success"
            />

            <StatCard
              label="Waist reduced"
              value={`${waistReduced >= 0 ? "-" : "+"}${Math.abs(waistReduced).toFixed(1)} in`}
              icon={Ruler}
              tone="accent"
            />
          </div>

          <Tabs
            defaultValue="weight"
            className="mt-6"
          >
            <TabsList>
              <TabsTrigger value="weight">
                Weight
              </TabsTrigger>

              <TabsTrigger value="measurements">
                Measurements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weight">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Body weight trend
                  </CardTitle>
                </CardHeader>

                <CardContent className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={progress}
                      margin={{
                        left: -16,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />

                      <YAxis
                        domain={[
                          "auto",
                          "auto",
                        ]}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />

                      <Tooltip
                        contentStyle={
                          tooltipStyle
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--color-accent)"
                        strokeWidth={2.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="measurements">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Body measurements
                    (inches)
                  </CardTitle>
                </CardHeader>

                <CardContent className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={progress}
                      margin={{
                        left: -16,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />

                      <Tooltip
                        contentStyle={
                          tooltipStyle
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="chest"
                        stroke="var(--color-chart-1)"
                        strokeWidth={2}
                        name="Chest"
                      />

                      <Line
                        type="monotone"
                        dataKey="waist"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2}
                        name="Waist"
                      />

                      <Line
                        type="monotone"
                        dataKey="arms"
                        stroke="var(--color-chart-3)"
                        strokeWidth={2}
                        name="Arms"
                      />

                      <Line
                        type="monotone"
                        dataKey="thighs"
                        stroke="var(--color-chart-4)"
                        strokeWidth={2}
                        name="Thighs"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}