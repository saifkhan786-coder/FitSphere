import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck,
  Flame,
  QrCode,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/member/attendance")({
  head: () => ({
    meta: [
      {
        title: "My Attendance — Smart Gym",
      },
      {
        name: "description",
        content:
          "Scan the gym QR to check in and review your weekly and monthly attendance streak.",
      },
      {
        property: "og:title",
        content: "My Attendance — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "QR check-in and your gym attendance history.",
      },
    ],
  }),
  component: MemberAttendance,
});

function MemberAttendance() {
  const searchParams = new URLSearchParams(
    window.location.search,
  );

  const qrCheckIn =
    searchParams.get("qr") === "1";

  const [checked, setChecked] = useState(false);

  const [memberId, setMemberId] = useState<string | null>(
    null,
  );

  const [memberName, setMemberName] = useState("");

  const [checkingIn, setCheckingIn] = useState(false);

  const [attendance, setAttendance] = useState<any[]>([]);

  const [loadingAttendance, setLoadingAttendance] =
    useState(true);

  /*
   * Fetch member profile
   */
  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        const token =
          localStorage.getItem("smartgym.token");

        if (!token) {
          toast.error("Please login again");
          return;
        }

        const response = await fetch(
          "/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load member profile",
          );
        }

        if (!data.user?.member) {
          throw new Error(
            "Member profile not found",
          );
        }

        setMemberId(data.user.member.id);
        setMemberName(data.user.name);
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load member profile",
        );
      }
    };

    fetchMemberProfile();
  }, []);

  /*
   * QR check-in
   */
  useEffect(() => {
    if (!qrCheckIn) {
      return;
    }

    const checkInWithQR = async () => {
      try {
        const token =
          localStorage.getItem("smartgym.token");

        if (!token) {
          toast.error("Please login again");
          return;
        }

        setCheckingIn(true);

        const response = await fetch(
          "/api/attendance/qr-checkin",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to check in with QR",
          );
        }

        setChecked(true);

        setAttendance((prev) => [
          data.attendance,
          ...prev,
        ]);

        toast.success(
          "QR check-in successful!",
        );
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to check in with QR",
        );
      } finally {
        setCheckingIn(false);
      }
    };

    checkInWithQR();
  }, [qrCheckIn]);

  /*
   * Fetch member attendance
   */
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token =
          localStorage.getItem("smartgym.token");

        if (!token) {
          toast.error("Please login again");
          return;
        }

        setLoadingAttendance(true);

        const response = await fetch(
          "/api/attendance/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load attendance",
          );
        }

        setAttendance(data.attendance || []);
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load attendance",
        );
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, []);

  /*
   * Check in member manually
   */
  const handleCheckIn = async () => {
    try {
      if (!memberId) {
        toast.error(
          "Member information not available",
        );
        return;
      }

      const token =
        localStorage.getItem("smartgym.token");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      setCheckingIn(true);

      const response = await fetch(
        "/api/attendance/checkin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            memberId,
            memberName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to check in",
        );
      }

      setChecked(true);

      /*
       * Add the new attendance record
       * immediately to the local state.
       */
      setAttendance((prev) => [
        data.attendance,
        ...prev,
      ]);

      toast.success(
        "Checked in successfully — enjoy your session!",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to check in",
      );
    } finally {
      setCheckingIn(false);
    }
  };

  /*
   * Get today's date
   */
  const today = new Date();

  /*
   * Start of current week
   * Sunday = first day of week
   */
  const startOfWeek = new Date(today);

  startOfWeek.setHours(0, 0, 0, 0);

  startOfWeek.setDate(
    today.getDate() - today.getDay(),
  );

  /*
   * Attendance this week
   */
  const thisWeekAttendance =
    attendance.filter((record) => {
      const attendanceDate = new Date(
        record.checkInTime,
      );

      return attendanceDate >= startOfWeek;
    });

  /*
   * Attendance this month
   */
  const thisMonthAttendance =
    attendance.filter((record) => {
      const attendanceDate = new Date(
        record.checkInTime,
      );

      return (
        attendanceDate.getMonth() ===
          today.getMonth() &&
        attendanceDate.getFullYear() ===
          today.getFullYear()
      );
    });

  /*
   * Current attendance streak
   */
  const getCurrentStreak = () => {
    if (attendance.length === 0) {
      return 0;
    }

    /*
     * Create a list of unique attendance dates.
     */
    const uniqueDates = Array.from(
      new Set(
        attendance.map((record) => {
          const date = new Date(
            record.checkInTime,
          );

          return `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}-${String(
            date.getDate(),
          ).padStart(2, "0")}`;
        }),
      ),
    )
      .map((date) => new Date(date))
      .sort(
        (a, b) =>
          b.getTime() - a.getTime(),
      );

    let streak = 0;

    /*
     * Start checking from today.
     */
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    for (
      let i = 0;
      i < uniqueDates.length;
      i++
    ) {
      const expectedDate = new Date(
        currentDate,
      );

      expectedDate.setDate(
        currentDate.getDate() - i,
      );

      const actualDate = uniqueDates[i];

      /*
       * TypeScript safety check.
       */
      if (!actualDate) {
        break;
      }

      actualDate.setHours(0, 0, 0, 0);

      if (
        actualDate.getTime() ===
        expectedDate.getTime()
      ) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak =
    getCurrentStreak();

  /*
   * Weekly chart data
   */
  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const weeklyChartData =
    weekDays.map((day, index) => {
      const count =
        thisWeekAttendance.filter(
          (record) => {
            const date = new Date(
              record.checkInTime,
            );

            return (
              date.getDay() === index
            );
          },
        ).length;

      return {
        label: day,
        sessions: count,
      };
    });

  /*
   * Monthly calendar
   */
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  /*
   * Store the dates on which the member
   * attended during the current month.
   */
  const attendedDates = new Set(
    thisMonthAttendance.map((record) => {
      const date = new Date(
        record.checkInTime,
      );

      return date.getDate();
    }),
  );

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Check in and keep your streak alive"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current streak"
          value={`${currentStreak} days`}
          icon={Flame}
          tone="warning"
        />

        <StatCard
          label="This week"
          value={`${thisWeekAttendance.length} sessions`}
          icon={CalendarCheck}
          tone="success"
        />

        <StatCard
          label="This month"
          value={`${thisMonthAttendance.length} sessions`}
          icon={CalendarCheck}
          tone="accent"
        />

        <StatCard
          label="Avg. session"
          value="52 min"
          icon={Timer}
          tone="info"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Check in
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary">
              <QrCode className="size-32 text-foreground/80" />
            </div>

            {checked ? (
              <Badge
                className="w-full justify-center bg-success/12 py-2 text-success"
                variant="outline"
              >
                Checked in successfully
              </Badge>
            ) : (
              <Button
                className="w-full"
                onClick={handleCheckIn}
                disabled={
                  checkingIn ||
                  !memberId
                }
              >
                {checkingIn
                  ? "Checking in..."
                  : "Scan & check in"}
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Show this code at the entrance
              scanner, or tap the button to
              log your session manually.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              This week
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {loadingAttendance ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading attendance...
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={weeklyChartData}
                  margin={{ left: -16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "var(--color-card)",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />

                  <Bar
                    dataKey="sessions"
                    fill="var(--color-accent)"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            Monthly calendar
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({
              length: daysInMonth,
            }).map((_, i) => {
              const dayNumber = i + 1;

              const attended =
                attendedDates.has(
                  dayNumber,
                );

              return (
                <div
                  key={dayNumber}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
                    attended
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {dayNumber}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}