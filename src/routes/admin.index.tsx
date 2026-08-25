import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CreditCard, IndianRupee, TrendingUp, UserCheck, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, StatCard, StatusBadge, currency } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceTrend, members, payments, plans, revenueTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Smart Gym" },
      { name: "description", content: "Revenue, membership and attendance overview for the gym at a glance." },
      { property: "og:title", content: "Admin Dashboard — Smart Gym" },
      { property: "og:description", content: "Revenue, membership and attendance overview for the gym." },
    ],
  }),
  component: AdminDashboard,
});

const pieColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function AdminDashboard() {
  const active = members.filter((m) => m.status === "Active").length;
  const expiring = members.filter((m) => m.status === "Expiring Soon").length;
  const pending = payments.filter((p) => p.status !== "Paid");
  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Gym performance overview for August 2026"
        action={
          <Button asChild>
            <Link to="/admin/register">Register member</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total members" value={members.length * 9} icon={Users} delta="+18 this month" />
        <StatCard label="Active memberships" value={active * 9} icon={UserCheck} tone="success" delta="92% retention" />
        <StatCard label="Revenue collected" value={currency(revenue)} icon={IndianRupee} tone="accent" delta="+9.6% MoM" />
        <StatCard label="Pending payments" value={pending.length} icon={CreditCard} tone="warning" delta="Follow up needed" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-accent" /> Revenue trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                  formatter={(v: number) => currency(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plans}
                  dataKey="activeMembers"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {plans.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent members</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/members">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.slice(0, 6).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.id}</p>
                    </TableCell>
                    <TableCell>{m.plan}</TableCell>
                    <TableCell className="text-muted-foreground">{m.expiryDate}</TableCell>
                    <TableCell className="pr-6">
                      <StatusBadge status={m.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="flex gap-3 p-5">
              <AlertTriangle className="size-5 shrink-0 text-warning" />
              <div>
                <p className="font-medium">{expiring * 9} memberships expiring</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send renewal reminders before the end of the week.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/admin/memberships">Review</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly attendance</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="present" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
