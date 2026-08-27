import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Check, IdCard } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, StatusBadge, currency } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { members, plans } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/memberships")({
  head: () => ({
    meta: [
      { title: "Memberships — Smart Gym Admin" },
      { name: "description", content: "Manage membership plans, pricing and upcoming renewals across the gym." },
      { property: "og:title", content: "Memberships — Smart Gym Admin" },
      { property: "og:description", content: "Plans, pricing and upcoming membership renewals." },
    ],
  }),
  component: MembershipsPage,
});

function MembershipsPage() {
  const expiring = members.filter((m) => m.status !== "Active");
  const totalActive = plans.reduce((s, p) => s + p.activeMembers, 0);

  return (
    <>
      <PageHeader title="Memberships" description="Plans, pricing and renewal pipeline" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active memberships" value={totalActive} icon={IdCard} tone="success" />
        <StatCard label="Renewals due" value={expiring.length * 3} icon={CalendarClock} tone="warning" />
        <StatCard
          label="Plan value / month"
          value={currency(plans.reduce((s, p) => s + (p.price / p.months) * p.activeMembers, 0))}
          icon={Check}
          tone="accent"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col transition-shadow hover:shadow-[var(--shadow-lift)]">
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between text-base">
                {plan.name}
                <span className="text-xs font-normal text-muted-foreground">
                  {plan.months} month{plan.months > 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="font-display text-3xl font-semibold tracking-tight">{currency(plan.price)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {currency(Math.round(plan.price / plan.months))} / month · {plan.activeMembers} members
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-5 w-full"
                onClick={() => toast.info(`${plan.name} plan editor coming from the API layer`)}
              >
                Edit plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Upcoming renewals</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiring.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.id}</p>
                    </TableCell>
                    <TableCell>{m.plan}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.expiryDate}</TableCell>
                    <TableCell>{currency(m.fee)}</TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button size="sm" variant="outline" onClick={() => toast.success(`Reminder sent to ${m.name}`)}>
                        Send reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
