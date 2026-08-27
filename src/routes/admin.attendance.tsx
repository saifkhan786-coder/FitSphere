import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, QrCode, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceTrend, members } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Smart Gym Admin" },
      { name: "description", content: "QR check-in, daily attendance marking and weekly gym footfall trends." },
      { property: "og:title", content: "Attendance — Smart Gym Admin" },
      { property: "og:description", content: "QR check-in and daily attendance tracking." },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const roster = members.slice(0, 10);
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(roster.map((m, i) => [m.id, i % 3 !== 2])),
  );
  const presentCount = Object.values(present).filter(Boolean).length;

  return (
    <>
      <PageHeader title="Attendance" description="Today · 25 August 2026" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Checked in today" value={presentCount * 18} icon={UserCheck} tone="success" />
        <StatCard label="Absent today" value={(roster.length - presentCount) * 18} icon={UserX} tone="warning" />
        <StatCard label="Peak hour" value="7 – 9 PM" icon={CalendarDays} tone="info" />
        <StatCard label="Avg. weekly visits" value="4.2" icon={QrCode} tone="accent" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">QR check-in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary">
              <QrCode className="size-32 text-foreground/80" />
            </div>
            <p className="text-sm text-muted-foreground">
              Members scan this code at the entrance to log their session automatically.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Enter member ID" />
              <Button onClick={() => toast.success("Check-in recorded")}>Check in</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly footfall</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend} margin={{ left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="present" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="var(--color-muted)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Mark attendance</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Last visit</TableHead>
                <TableHead className="pr-6 text-right">Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="pl-6">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.id}</p>
                  </TableCell>
                  <TableCell>{m.plan}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Yesterday, 7:12 PM</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Switch
                      checked={!!present[m.id]}
                      onCheckedChange={(v) => setPresent((prev) => ({ ...prev, [m.id]: v }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
