import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  QrCode,
  UserCheck,
  UserX,
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

import { Input } from "@/components/ui/input";

import { Switch } from "@/components/ui/switch";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAuth } from "@/lib/auth";

export const Route = createFileRoute(
  "/admin/attendance",
)({
  head: () => ({
    meta: [
      {
        title: "Attendance — Smart Gym Admin",
      },
      {
        name: "description",
        content:
          "QR check-in, daily attendance marking and weekly gym footfall trends.",
      },
      {
        property: "og:title",
        content: "Attendance — Smart Gym Admin",
      },
      {
        property: "og:description",
        content:
          "QR check-in and daily attendance tracking.",
      },
    ],
  }),

  component: AttendancePage,
});

function AttendancePage() {
  const { user } = useAuth();

  const [attendance, setAttendance] =
    useState<any[]>([]);

  const [weeklyAttendance, setWeeklyAttendance] =
    useState<any[]>([]);

  const [memberIdInput, setMemberIdInput] =
    useState("");

  const [realMembers, setRealMembers] =
    useState<any[]>([]);

  const [loadingWeeklyAttendance, setLoadingWeeklyAttendance] =
    useState(true);

  const roster = realMembers.slice(0, 10);

  const [present, setPresent] =
    useState<Record<string, boolean>>(
      Object.fromEntries(
        roster.map((m, i) => [
          m._id || m.id,
          i % 3 !== 2,
        ]),
      ),
    );

  const presentCount =
    Object.values(present).filter(Boolean).length;

  /*
   * Fetch today's attendance
   */
  const fetchAttendance = async () => {
    try {
      const token =
        localStorage.getItem("smartgym.token");

      const response = await fetch(
        "http://localhost:5000/api/attendance/today",
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
            "Failed to fetch attendance",
        );
      }

      setAttendance(data.attendance || []);
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load today's attendance",
      );
    }
  };

  /*
   * Fetch weekly attendance
   */
  const fetchWeeklyAttendance = async () => {
    try {
      const token =
        localStorage.getItem("smartgym.token");

      setLoadingWeeklyAttendance(true);

      const response = await fetch(
        "http://localhost:5000/api/attendance/weekly",
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
            "Failed to fetch weekly attendance",
        );
      }

      setWeeklyAttendance(
        data.attendance || [],
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load weekly attendance",
      );
    } finally {
      setLoadingWeeklyAttendance(false);
    }
  };

  /*
   * Fetch members
   */
  const fetchMembers = async () => {
    try {
      const token =
        localStorage.getItem("smartgym.token");

      const response = await fetch(
        "http://localhost:5000/api/auth/admin/members",
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
            "Failed to fetch members",
        );
      }

      setRealMembers(data.members || []);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load members");
    }
  };

  /*
   * Load attendance and members
   */
  useEffect(() => {
    if (user) {
      fetchAttendance();
      fetchWeeklyAttendance();
      fetchMembers();
    }
  }, [user]);

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Today's attendance"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Checked in today"
          value={attendance.length}
          icon={UserCheck}
          tone="success"
        />

        <StatCard
          label="Absent today"
          value={Math.max(
            realMembers.length -
              attendance.length,
            0,
          )}
          icon={UserX}
          tone="warning"
        />

        <StatCard
          label="Peak hour"
          value="7 – 9 PM"
          icon={CalendarDays}
          tone="info"
        />

        <StatCard
          label="Avg. weekly visits"
          value="4.2"
          icon={QrCode}
          tone="accent"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* QR CHECK-IN */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              QR check-in
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary">
              <QrCode className="size-32 text-foreground/80" />
            </div>

            <p className="text-sm text-muted-foreground">
              Members scan this code at the
              entrance to log their session
              automatically.
            </p>

            <div className="flex gap-2">
              <Input
                placeholder="Enter member ID"
                value={memberIdInput}
                onChange={(e) =>
                  setMemberIdInput(
                    e.target.value,
                  )
                }
              />

              <Button
                onClick={async () => {
                  try {
                    if (
                      !memberIdInput.trim()
                    ) {
                      toast.error(
                        "Please enter a member ID",
                      );
                      return;
                    }

                    const token =
                      localStorage.getItem(
                        "smartgym.token",
                      );

                    const selectedMember =
                      realMembers.find(
                        (member) =>
                          member._id ===
                            memberIdInput.trim() ||
                          member.id ===
                            memberIdInput.trim(),
                      );

                    if (!selectedMember) {
                      toast.error(
                        "Member not found",
                      );
                      return;
                    }

                    const response =
                      await fetch(
                        "http://localhost:5000/api/attendance/checkin",
                        {
                          method: "POST",

                          headers: {
                            "Content-Type":
                              "application/json",

                            Authorization: `Bearer ${token}`,
                          },

                          body: JSON.stringify({
                            memberId:
                              selectedMember._id ||
                              selectedMember.id,

                            memberName:
                              selectedMember.name,
                          }),
                        },
                      );

                    const data =
                      await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data.message ||
                          "Failed to record attendance",
                      );
                    }

                    /*
                     * Update today's attendance
                     */
                    setAttendance(
                      (prev) => [
                        ...prev,
                        data.attendance,
                      ],
                    );

                    /*
                     * Refresh weekly graph
                     * with real database data.
                     */
                    await fetchWeeklyAttendance();

                    setMemberIdInput("");

                    toast.success(
                      "Check-in recorded successfully",
                    );
                  } catch (error) {
                    console.error(error);

                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Failed to record attendance",
                    );
                  }
                }}
              >
                Check in
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WEEKLY FOOTFALL */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Weekly footfall
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {loadingWeeklyAttendance ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading weekly attendance...
              </div>
            ) : weeklyAttendance.length ===
              0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No attendance data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={weeklyAttendance}
                  margin={{ left: -16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
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
                    dataKey="present"
                    name="Present"
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

      {/* TODAY'S ATTENDANCE */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            Today's attendance
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">
                  Member
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Check-in time
                </TableHead>

                <TableHead className="pr-6 text-right">
                  Present
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No attendance recorded
                    today.
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map(
                  (record) => (
                    <TableRow
                      key={record._id}
                    >
                      <TableCell className="pl-6">
                        <p className="font-medium">
                          {
                            record.memberName
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            record.memberId
                          }
                        </p>
                      </TableCell>

                      <TableCell>
                        {record.status}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(
                          record.checkInTime,
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <Switch
                          checked={
                            record.status ===
                            "Present"
                          }
                          disabled
                        />
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}