import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Flame, QrCode, Timer } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memberAttendanceHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/member/attendance")({
  head: () => ({
    meta: [
      { title: "My Attendance — Smart Gym" },
      { name: "description", content: "Scan the gym QR to check in and review your weekly and monthly attendance streak." },
      { property: "og:title", content: "My Attendance — Smart Gym" },
      { property: "og:description", content: "QR check-in and your gym attendance history." },
    ],
  }),
  component: MemberAttendance,
});

function MemberAttendance() {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <PageHeader title="Attendance" description="Check in and keep your streak alive" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current streak" value="7 days" icon={Flame} tone="warning" />
        <StatCard label="This week" value="5 sessions" icon={CalendarCheck} tone="success" />
        <StatCard label="This month" value="18 sessions" icon={CalendarCheck} tone="accent" />
        <StatCard label="Avg. session" value="52 min" icon={Timer} tone="info" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Check in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary">
              <QrCode className="size-32 text-foreground/80" />
            </div>
            {checked ? (
              <Badge className="w-full justify-center bg-success/12 py-2 text-success" variant="outline">
                Checked in today at 7:05 PM
              </Badge>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  setChecked(true);
                  toast.success("Checked in — enjoy your session! +20 XP");
                }}
              >
                Scan & check in
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Show this code at the entrance scanner, or tap the button to log your session manually.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">This week</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberAttendanceHistory} margin={{ left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="sessions" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Monthly calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const attended = i % 7 !== 2 && i % 7 !== 6 && i < 25;
              return (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
                    attended ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
