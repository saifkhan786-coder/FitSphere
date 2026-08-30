import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Check, CreditCard, IdCard } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, StatusBadge, currency } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { members, payments, plans } from "@/lib/mock-data";

export const Route = createFileRoute("/member/membership")({
  head: () => ({
    meta: [
      { title: "My Membership — Smart Gym" },
      { name: "description", content: "View your active plan, validity, payment history and available upgrade options." },
      { property: "og:title", content: "My Membership — Smart Gym" },
      { property: "og:description", content: "Your plan, validity and payment history." },
    ],
  }),
  component: MembershipPage,
});

function MembershipPage() {
  const me = members[0]!;
  const myPayments = payments.slice(0, 4);
  const daysLeft = 42;
  const totalDays = 90;

  return (
    <>
      <PageHeader title="My membership" description="Plan details, validity and payments" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current plan" value={me.plan} icon={IdCard} tone="accent" />
        <StatCard label="Days remaining" value={daysLeft} icon={CalendarClock} tone="info" />
        <StatCard label="Fee paid" value={currency(me.fee)} icon={CreditCard} tone="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Validity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Started {me.startDate}</span>
              <StatusBadge status={me.status} />
              <span className="text-muted-foreground">Expires {me.expiryDate}</span>
            </div>
            <Progress value={((totalDays - daysLeft) / totalDays) * 100} />
            <p className="text-sm text-muted-foreground">
              {daysLeft} of {totalDays} days remaining on your {me.plan} plan.
            </p>
            <Button onClick={() => toast.success("Renewal request sent to the front desk")}>Renew membership</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan perks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(plans.find((p) => p.name === me.plan) ?? plans[0]!).perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{perk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.name === me.plan ? "border-accent" : ""}>
            <CardHeader>
              <CardTitle className="text-base">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-semibold">{currency(plan.price)}</p>
              <p className="text-xs text-muted-foreground">
                {plan.months} month{plan.months > 1 ? "s" : ""}
              </p>
              <Button
                variant={plan.name === me.plan ? "secondary" : "outline"}
                className="mt-4 w-full"
                disabled={plan.name === me.plan}
                onClick={() => toast.success(`Upgrade request for ${plan.name} sent`)}
              >
                {plan.name === me.plan ? "Current plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6 font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.date}</TableCell>
                  <TableCell>{currency(p.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.method}</TableCell>
                  <TableCell className="pr-6">
                    <StatusBadge status={p.status} />
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
