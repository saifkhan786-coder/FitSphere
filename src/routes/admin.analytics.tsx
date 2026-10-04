import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
  currency,
} from "@/components/common/ui-kit";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute(
  "/admin/analytics"
)({
  head: () => ({
    meta: [
      {
        title: "Analytics — FitSphere Admin",
      },
      {
        name: "description",
        content:
          "Revenue growth, member acquisition, attendance and plan performance charts.",
      },
      {
        property: "og:title",
        content: "Analytics —  FitSphere Admin",
      },
      {
        property: "og:description",
        content:
          "Revenue, membership and attendance analytics for the gym.",
      },
    ],
  }),

  component: AnalyticsPage,
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

type MemberGrowthPoint = {
  month: string;
  members: number;
};

type PlanDistribution = {
  name: string;
  value: number;
};

const pieColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
} as const;

function AnalyticsPage() {
  const [members, setMembers] =
    useState<Member[]>([]);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [plans, setPlans] =
    useState<Plan[]>([]);

  const [attendanceTrend, setAttendanceTrend] =
    useState<AttendanceDay[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
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
        "Analytics error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ===============================
   * REVENUE
   * ===============================
   */

  const revenueTrend = useMemo(
    () =>
      createRevenueTrend(payments),
    [payments]
  );

  const totalRevenue = useMemo(
    () =>
      payments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.paidAmount || 0
          ),
        0
      ),
    [payments]
  );

  /*
   * ===============================
   * MEMBER GROWTH
   * ===============================
   */

  const memberGrowth = useMemo(
    () =>
      createMemberGrowth(
        members
      ),
    [members]
  );

  /*
   * ===============================
   * PLAN DISTRIBUTION
   * ===============================
   */

  const planDistribution =
    useMemo(() => {
      return createPlanDistribution(
        plans,
        members
      );
    }, [plans, members]);

  /*
   * ===============================
   * RETENTION
   * ===============================
   */

  const activeMembers =
    members.filter((member) => {
      const expiry =
        member.membershipExpiryDate ||
        member.expiryDate;

      if (!expiry) {
        return false;
      }

      return (
        new Date(expiry).getTime() >=
        Date.now()
      );
    });

  const retentionRate =
    members.length > 0
      ? Math.round(
          (activeMembers.length /
            members.length) *
            100
        )
      : 0;

  /*
   * ===============================
   * AVERAGE DAILY FOOTFALL
   * ===============================
   */

  const totalAttendance =
    attendanceTrend.reduce(
      (sum, day) =>
        sum + Number(day.present || 0),
      0
    );

  const averageDailyFootfall =
    attendanceTrend.length > 0
      ? Math.round(
          totalAttendance /
            attendanceTrend.length
        )
      : 0;

  if (loading) {
    return (
      <>
        <PageHeader
          title="Analytics"
          description="Loading business analytics..."
        />

        <div className="py-16 text-center text-muted-foreground">
          Loading analytics...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Analytics"
          description="Unable to load analytics data"
        />

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Business performance for the last 6 months"
      />

      {/* =============================== */}
      {/* STAT CARDS */}
      {/* =============================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (6 mo)"
          value={currency(
            totalRevenue
          )}
          icon={Wallet}
          tone="success"
        />

        <StatCard
          label="Active members"
          value={activeMembers.length}
          icon={Users}
          tone="accent"
        />

        <StatCard
          label="Retention rate"
          value={`${retentionRate}%`}
          icon={TrendingUp}
          tone="info"
        />

        <StatCard
          label="Avg. daily footfall"
          value={averageDailyFootfall}
          icon={BarChart3}
        />
      </div>

      {/* =============================== */}
      {/* CHARTS */}
      {/* =============================== */}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">

        {/* REVENUE */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Revenue growth
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {revenueTrend.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={revenueTrend}
                  margin={{
                    left: -8,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="revGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-accent)"
                        stopOpacity={0.5}
                      />

                      <stop
                        offset="100%"
                        stopColor="var(--color-accent)"
                        stopOpacity={0}
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
                    contentStyle={
                      tooltipStyle
                    }
                    formatter={(
                      value: number
                    ) =>
                      currency(value)
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* MEMBER GROWTH */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Member growth
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {memberGrowth.length ===
            0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={memberGrowth}
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
                    contentStyle={
                      tooltipStyle
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="members"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* PLAN DISTRIBUTION */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Plan distribution
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {planDistribution.length ===
            0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      planDistribution
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
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

                  <Legend />

                  <Tooltip
                    contentStyle={
                      tooltipStyle
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* ATTENDANCE */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Attendance pattern
            </CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {attendanceTrend.length ===
            0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={attendanceTrend}
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
                    dataKey="day"
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

                  <Bar
                    dataKey="present"
                    fill="var(--color-chart-1)"
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
  const currentDate =
    new Date();

  const months: RevenuePoint[] =
    [];

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

    if (
      Number.isNaN(
        paymentDate.getTime()
      )
    ) {
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
      months[index].revenue +=
        Number(
          payment.paidAmount || 0
        );
    }
  });

  return months;
}

/*
 * ========================================
 * MEMBER GROWTH
 * ========================================
 */

function createMemberGrowth(
  members: Member[]
): MemberGrowthPoint[] {
  const currentDate =
    new Date();

  const months: MemberGrowthPoint[] =
    [];

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

      members: 0,
    });
  }

  members.forEach((member) => {
    if (!member.createdAt) {
      return;
    }

    const createdDate =
      new Date(member.createdAt);

    if (
      Number.isNaN(
        createdDate.getTime()
      )
    ) {
      return;
    }

    const monthDifference =
      (currentDate.getFullYear() -
        createdDate.getFullYear()) *
        12 +
      (currentDate.getMonth() -
        createdDate.getMonth());

    if (
      monthDifference < 0 ||
      monthDifference > 5
    ) {
      return;
    }

    const index =
      5 - monthDifference;

    if (months[index]) {
      months[index].members += 1;
    }
  });

  /*
   * Convert monthly registrations
   * into cumulative member count.
   */

  let total = 0;

  months.forEach((month) => {
    total += month.members;
    month.members = total;
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
  members: Member[]
): PlanDistribution[] {
  return plans
    .map((plan) => {
      const count =
        members.filter(
          (member) =>
            getMemberPlan(member) ===
            plan.name
        ).length;

      return {
        name: plan.name,
        value: count,
      };
    })
    .filter(
      (plan) =>
        plan.value > 0
    );
}

function getMemberPlan(
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
 * EMPTY CHART
 * ========================================
 */

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      No data available
    </div>
  );
}