import { createFileRoute, Link } from "@tanstack/react-router";

import {
  AlertTriangle,
  CreditCard,
  IndianRupee,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

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

import {
  PageHeader,
  StatCard,
  StatusBadge,
  currency,
} from "@/components/common/ui-kit";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      {
        title: "Admin Dashboard — Smart Gym",
      },
      {
        name: "description",
        content:
          "Revenue, membership and attendance overview for the gym at a glance.",
      },
      {
        property: "og:title",
        content: "Admin Dashboard — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "Revenue, membership and attendance overview for the gym.",
      },
    ],
  }),

  component: AdminDashboard,
});

type Member = {
  _id?: string;
  id?: string;

  name: string;

  membershipPlan?: string;
  plan?: string;

  membershipExpiryDate?: string;
  expiryDate?: string;

  createdAt?: string;
};

type Payment = {
  _id: string;

  memberName: string;

  date: string;

  plan: string;

  paidAmount: number;

  remaining: number;

  method: string;

  status: string;
};

type Plan = {
  _id: string;

  name: string;

  price: number;

  months: number;

  perks: string[];
};

type AttendanceDay = {
  day: string;
  present: number;
};

type RevenuePoint = {
  month: string;
  revenue: number;
};

type PlanDistribution = {
  name: string;
  activeMembers: number;
};

const pieColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [attendanceTrend, setAttendanceTrend] =
    useState<AttendanceDay[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "smartgym.token"
      );

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        membersResponse,
        paymentsResponse,
        plansResponse,
        attendanceResponse,
      ] = await Promise.all([
        fetch(
          "http://localhost:5000/api/auth/admin/members",
          {
            headers,
          }
        ),

        fetch(
          "http://localhost:5000/api/payments",
          {
            headers,
          }
        ),

        fetch(
          "http://localhost:5000/api/plans",
          {
            headers,
          }
        ),

        fetch(
          "http://localhost:5000/api/attendance/weekly",
          {
            headers,
          }
        ),
      ]);

      const membersData =
        await membersResponse.json();

      const paymentsData =
        await paymentsResponse.json();

      const plansData =
        await plansResponse.json();

      const attendanceData =
        await attendanceResponse.json();

      if (!membersResponse.ok) {
        throw new Error(
          membersData.message ||
            "Failed to fetch members"
        );
      }

      if (!paymentsResponse.ok) {
        throw new Error(
          paymentsData.message ||
            "Failed to fetch payments"
        );
      }

      if (!plansResponse.ok) {
        throw new Error(
          plansData.message ||
            "Failed to fetch plans"
        );
      }

      if (!attendanceResponse.ok) {
        throw new Error(
          attendanceData.message ||
            "Failed to fetch attendance"
        );
      }

      setMembers(
        membersData.members || []
      );

      setPayments(
        paymentsData.payments || []
      );

      setPlans(
        plansData.plans || []
      );

      setAttendanceTrend(
        attendanceData.attendance || []
      );
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
  };

  /*
   * -----------------------------
   * MEMBERS
   * -----------------------------
   */

  const getExpiryDate = (
    member: Member
  ) => {
    return (
      member.membershipExpiryDate ||
      member.expiryDate
    );
  };

  const getPlanName = (
    member: Member
  ) => {
    return (
      member.membershipPlan ||
      member.plan ||
      "No plan"
    );
  };

  const now = new Date();

  const activeMembers = members.filter(
    (member) => {
      const expiry = getExpiryDate(member);

      if (!expiry) {
        return false;
      }

      return (
        new Date(expiry).getTime() >=
        now.getTime()
      );
    }
  );

  const expiringMembers = members.filter(
    (member) => {
      const expiry = getExpiryDate(member);

      if (!expiry) {
        return false;
      }

      const expiryTime =
        new Date(expiry).getTime();

      const difference =
        expiryTime - now.getTime();

      const days =
        difference /
        (1000 * 60 * 60 * 24);

      return days >= 0 && days <= 7;
    }
  );

  /*
   * -----------------------------
   * PAYMENTS
   * -----------------------------
   */

  const pendingPayments =
    payments.filter(
      (payment) =>
        payment.status !== "Paid"
    );

  const revenue = payments.reduce(
    (sum, payment) =>
      sum +
      Number(payment.paidAmount || 0),
    0
  );

  /*
   * -----------------------------
   * REVENUE TREND
   * -----------------------------
   */

  const revenueTrend =
    createRevenueTrend(payments);

  /*
   * -----------------------------
   * PLAN DISTRIBUTION
   * -----------------------------
   */

  const planDistribution =
    createPlanDistribution(
      plans,
      activeMembers
    );

  /*
   * -----------------------------
   * RECENT MEMBERS
   * -----------------------------
   */

  const recentMembers =
    [...members].slice(0, 6);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Loading gym performance data..."
        />

        <div className="py-16 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Unable to load dashboard data"
        />

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>

            <Button
              className="mt-4"
              onClick={fetchDashboardData}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Real-time gym performance overview"
        action={
          <Button asChild>
            <Link to="/admin/register">
              Register member
            </Link>
          </Button>
        }
      />

      {/* ========================= */}
      {/* STAT CARDS */}
      {/* ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total members"
          value={members.length}
          icon={Users}
        />

        <StatCard
          label="Active memberships"
          value={activeMembers.length}
          icon={UserCheck}
          tone="success"
        />

        <StatCard
          label="Revenue collected"
          value={currency(revenue)}
          icon={IndianRupee}
          tone="accent"
        />

        <StatCard
          label="Pending payments"
          value={pendingPayments.length}
          icon={CreditCard}
          tone="warning"
        />
      </div>

      {/* ========================= */}
      {/* REVENUE + PLAN */}
      {/* ========================= */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-accent" />

              Revenue trend
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {revenueTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No payment data available
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={revenueTrend}
                  margin={{
                    left: -12,
                    right: 8,
                    top: 8,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="rev"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-accent)"
                        stopOpacity={0.7}
                      />

                      <stop
                        offset="100%"
                        stopColor="var(--color-accent)"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
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
                    contentStyle={{
                      background:
                        "var(--color-card)",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                    formatter={(value: number) =>
                      currency(value)
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Plan distribution
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {planDistribution.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No active memberships
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={planDistribution}
                    dataKey="activeMembers"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {planDistribution.map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={
                            pieColors[
                              index %
                                pieColors.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background:
                        "var(--color-card)",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========================= */}
      {/* RECENT MEMBERS */}
      {/* ========================= */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              Recent members
            </CardTitle>

            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/admin/members">
                View all
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="px-0">
            {recentMembers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No members found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">
                      Member
                    </TableHead>

                    <TableHead>
                      Plan
                    </TableHead>

                    <TableHead>
                      Expiry
                    </TableHead>

                    <TableHead className="pr-6">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentMembers.map(
                    (member, index) => {
                      const expiry =
                        getExpiryDate(
                          member
                        );

                      const isActive =
                        expiry &&
                        new Date(
                          expiry
                        ).getTime() >=
                          now.getTime();

                      return (
                        <TableRow
                          key={
                            member._id ||
                            member.id ||
                            `${member.name}-${index}`
                          }
                        >
                          <TableCell className="pl-6">
                            <p className="font-medium">
                              {member.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {member._id ||
                                member.id ||
                                "Member"}
                            </p>
                          </TableCell>

                          <TableCell>
                            {getPlanName(
                              member
                            )}
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {expiry
                              ? formatDate(
                                  expiry
                                )
                              : "—"}
                          </TableCell>

                          <TableCell className="pr-6">
                            <StatusBadge
                              status={
                                isActive
                                  ? "Active"
                                  : "Expired"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ========================= */}
        {/* EXPIRING MEMBERSHIPS */}
        {/* ========================= */}

        <div className="space-y-4">
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="flex gap-3 p-5">
              <AlertTriangle className="size-5 shrink-0 text-warning" />

              <div>
                <p className="font-medium">
                  {expiringMembers.length}{" "}
                  memberships expiring
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Memberships expiring within
                  the next 7 days.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  asChild
                >
                  <Link to="/admin/memberships">
                    Review
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ========================= */}
          {/* WEEKLY ATTENDANCE */}
          {/* ========================= */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Weekly attendance
              </CardTitle>
            </CardHeader>

            <CardContent className="h-48">
              {attendanceTrend.length ===
              0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No attendance data available
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={attendanceTrend}
                    margin={{
                      left: -20,
                    }}
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
                      fontSize={11}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
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
      </div>
    </>
  );
}

/*
 * ========================================
 * REVENUE TREND
 * ========================================
 */

function createRevenueTrend(
  payments: Payment[]
): RevenuePoint[] {
  const currentDate = new Date();

  const months: RevenuePoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );

    months.push({
      month: date.toLocaleString(
        "en-IN",
        {
          month: "short",
        }
      ),

      revenue: 0,
    });
  }

  payments.forEach((payment) => {
    const paymentDate =
      new Date(payment.date);

    if (Number.isNaN(
      paymentDate.getTime()
    )) {
      return;
    }

    const monthDifference =
      (currentDate.getFullYear() -
        paymentDate.getFullYear()) *
        12 +
      (currentDate.getMonth() -
        paymentDate.getMonth());

    if (
      monthDifference < 0 ||
      monthDifference > 5
    ) {
      return;
    }

    const index =
      5 - monthDifference;

    if (months[index]) {
      months[index].revenue += Number(
        payment.paidAmount || 0
      );
    }
  });

  return months;
}

/*
 * ========================================
 * PLAN DISTRIBUTION
 * ========================================
 */

function createPlanDistribution(
  plans: Plan[],
  activeMembers: Member[]
): PlanDistribution[] {
  return plans
    .map((plan) => {
      const count =
        activeMembers.filter(
          (member) =>
            getMemberPlanName(member) ===
            plan.name
        ).length;

      return {
        name: plan.name,
        activeMembers: count,
      };
    })
    .filter(
      (plan) =>
        plan.activeMembers > 0
    );
}

function getMemberPlanName(
  member: Member
) {
  return (
    member.membershipPlan ||
    member.plan ||
    ""
  );
}

/*
 * ========================================
 * DATE FORMAT
 * ========================================
 */

function formatDate(
  date: string
) {
  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/*
 * React imports used by the dashboard
 */

import {
  useEffect,
  useState,
} from "react";