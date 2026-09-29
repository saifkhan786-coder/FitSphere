import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  Check,
  IdCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute(
  "/admin/memberships"
)({
  head: () => ({
    meta: [
      {
        title: "Memberships — Smart Gym Admin",
      },
      {
        name: "description",
        content:
          "Manage membership plans, pricing and upcoming renewals across the gym.",
      },
      {
        property: "og:title",
        content:
          "Memberships — Smart Gym Admin",
      },
      {
        property: "og:description",
        content:
          "Plans, pricing and upcoming membership renewals.",
      },
    ],
  }),

  component: MembershipsPage,
});

function MembershipsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  // Plan currently being edited
  const [editingPlan, setEditingPlan] =
    useState<any>(null);

  // Form values for editing plan
  const [editName, setEditName] =
    useState("");

  const [editPrice, setEditPrice] =
    useState("");

  const [editMonths, setEditMonths] =
    useState("");

  const [editPerks, setEditPerks] =
    useState("");

  const [savingPlan, setSavingPlan] =
    useState(false);

  // -----------------------------------
  // Fetch members
  // -----------------------------------

  useEffect(() => {
    const token =
      localStorage.getItem(
        "smartgym.token"
      );

    fetch(
      "http://localhost:5000/api/auth/admin/members",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(
          "Memberships API result:",
          data
        );

        if (!data.success) {
          console.error(
            "Failed to load members:",
            data.message
          );
          return;
        }

        const formattedMembers =
          data.members.map(
            (member: any) => {
              const expiryDate =
                new Date(
                  member.membershipExpiryDate
                );

              const now =
                new Date();

              const sevenDaysFromNow =
                new Date(
                  Date.now() +
                    7 *
                      24 *
                      60 *
                      60 *
                      1000
                );

              let status =
                "Active";

              if (
                expiryDate < now
              ) {
                status = "Expired";
              } else if (
                expiryDate <=
                sevenDaysFromNow
              ) {
                status =
                  "Expiring Soon";
              }

              return {
                id: member._id,

                name: member.name,

                plan:
                  member.membershipPlan ||
                  "—",

                expiryDate:
                  member.membershipExpiryDate
                    ? expiryDate.toLocaleDateString()
                    : "—",

                fee:
                  member.amountPaid ||
                  0,

                status,
              };
            }
          );

        setMembers(
          formattedMembers
        );
      })
      .catch((error) => {
        console.error(
          "Memberships API error:",
          error
        );
      });
  }, []);

  // -----------------------------------
  // Fetch plans from MongoDB
  // -----------------------------------

  useEffect(() => {
    fetch(
      "http://localhost:5000/api/plans"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(
          "Plans API result:",
          data
        );

        if (data.success) {
          setPlans(data.plans);
        } else {
          console.error(
            "Failed to load plans:",
            data.message
          );
        }
      })
      .catch((error) => {
        console.error(
          "Plans API error:",
          error
        );
      });
  }, []);

  // -----------------------------------
  // Open Edit Plan dialog
  // -----------------------------------

  const openEditPlan = (
    plan: any
  ) => {
    setEditingPlan(plan);

    setEditName(
      plan.name || ""
    );

    setEditPrice(
      String(plan.price || "")
    );

    setEditMonths(
      String(plan.months || "")
    );

    setEditPerks(
      plan.perks?.join("\n") || ""
    );
  };

  // -----------------------------------
  // Close Edit Plan dialog
  // -----------------------------------

  const closeEditPlan = () => {
    if (savingPlan) {
      return;
    }

    setEditingPlan(null);

    setEditName("");
    setEditPrice("");
    setEditMonths("");
    setEditPerks("");
  };

  // -----------------------------------
  // Save edited plan
  // -----------------------------------

  const handleUpdatePlan = async () => {
    if (!editingPlan) {
      return;
    }

    if (
      !editName.trim() ||
      !editPrice ||
      !editMonths
    ) {
      toast.error(
        "Please fill all required fields"
      );

      return;
    }

    const price =
      Number(editPrice);

    const months =
      Number(editMonths);

    if (
      isNaN(price) ||
      price <= 0
    ) {
      toast.error(
        "Please enter a valid price"
      );

      return;
    }

    if (
      isNaN(months) ||
      months <= 0
    ) {
      toast.error(
        "Please enter a valid duration"
      );

      return;
    }

    const perks =
      editPerks
        .split("\n")
        .map(
          (perk) =>
            perk.trim()
        )
        .filter(
          (perk) =>
            perk.length > 0
        );

    try {
      setSavingPlan(true);

      const response =
        await fetch(
          `http://localhost:5000/api/plans/${editingPlan._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: editName.trim(),
              price,
              months,
              perks,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        toast.error(
          data.message ||
            "Failed to update plan"
        );

        return;
      }

      // Update plan in frontend
      setPlans(
        (currentPlans) =>
          currentPlans.map(
            (plan) =>
              plan._id ===
              editingPlan._id
                ? data.plan
                : plan
          )
      );

      toast.success(
        "Plan updated successfully"
      );

      closeEditPlan();

    } catch (error) {
      console.error(
        "Update plan error:",
        error
      );

      toast.error(
        "Something went wrong while updating the plan"
      );
    } finally {
      setSavingPlan(false);
    }
  };

  // -----------------------------------
  // Membership calculations
  // -----------------------------------

  const expiring =
    members.filter(
      (member) =>
        member.status ===
        "Expiring Soon"
    );

  const totalActive =
    members.filter(
      (member) =>
        member.status ===
        "Active"
    ).length;

  return (
    <>
      <PageHeader
        title="Memberships"
        description="Plans, pricing and renewal pipeline"
      />

      {/* -------------------------------- */}
      {/* Membership statistics */}
      {/* -------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active memberships"
          value={totalActive}
          icon={IdCard}
          tone="success"
        />

        <StatCard
          label="Renewals due"
          value={expiring.length}
          icon={CalendarClock}
          tone="warning"
        />

        <StatCard
          label="Plan value / month"
          value={currency(
            members.reduce(
              (sum, member) => {
                const plan =
                  plans.find(
                    (plan) =>
                      plan.name ===
                      member.plan
                  );

                if (!plan) {
                  return sum;
                }

                return (
                  sum +
                  plan.price /
                    plan.months
                );
              },
              0
            )
          )}
          icon={Check}
          tone="accent"
        />
      </div>

      {/* -------------------------------- */}
      {/* Membership Plans */}
      {/* -------------------------------- */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map(
          (plan) => (
            <Card
              key={plan._id}
              className="flex flex-col transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between text-base">
                  {plan.name}

                  <span className="text-xs font-normal text-muted-foreground">
                    {plan.months}{" "}
                    month
                    {plan.months >
                    1
                      ? "s"
                      : ""}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  {currency(
                    plan.price
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {currency(
                    Math.round(
                      plan.price /
                        plan.months
                    )
                  )}{" "}
                  / month ·{" "}
                  {
                    members.filter(
                      (member) =>
                        member.plan ===
                        plan.name
                    ).length
                  }{" "}
                  members
                </p>

                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {plan.perks.map(
                    (
                      perk: string
                    ) => (
                      <li
                        key={perk}
                        className="flex gap-2"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />

                        <span className="text-muted-foreground">
                          {perk}
                        </span>
                      </li>
                    )
                  )}
                </ul>

                {/* Edit Plan Button */}

                <Button
                  variant="outline"
                  className="mt-5 w-full"
                  onClick={() =>
                    openEditPlan(
                      plan
                    )
                  }
                >
                  Edit plan
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* -------------------------------- */}
      {/* Upcoming Renewals */}
      {/* -------------------------------- */}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            Upcoming renewals
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <div className="overflow-x-auto">
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

                  <TableHead>
                    Fee
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead className="pr-6 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {expiring.map(
                  (member) => (
                    <TableRow
                      key={
                        member.id
                      }
                    >
                      <TableCell className="pl-6">
                        <p className="font-medium">
                          {
                            member.name
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            member.id
                          }
                        </p>
                      </TableCell>

                      <TableCell>
                        {
                          member.plan
                        }
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {
                          member.expiryDate
                        }
                      </TableCell>

                      <TableCell>
                        {currency(
                          member.fee
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={
                            member.status
                          }
                        />
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toast.success(
                              `Reminder sent to ${member.name}`
                            )
                          }
                        >
                          Send reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ================================= */}
      {/* EDIT PLAN DIALOG */}
      {/* ================================= */}

      <Dialog
        open={
          editingPlan !== null
        }
        onOpenChange={(
          open
        ) => {
          if (!open) {
            closeEditPlan();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Edit {editingPlan?.name} Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Plan Name */}

            <div className="space-y-2">
              <Label htmlFor="plan-name">
                Plan name
              </Label>

              <Input
                id="plan-name"
                value={editName}
                onChange={(e) =>
                  setEditName(
                    e.target.value
                  )
                }
                placeholder="Basic"
              />
            </div>

            {/* Price */}

            <div className="space-y-2">
              <Label htmlFor="plan-price">
                Price (₹)
              </Label>

              <Input
                id="plan-price"
                type="number"
                min="1"
                value={editPrice}
                onChange={(e) =>
                  setEditPrice(
                    e.target.value
                  )
                }
                placeholder="1100"
              />
            </div>

            {/* Duration */}

            <div className="space-y-2">
              <Label htmlFor="plan-months">
                Duration (months)
              </Label>

              <Input
                id="plan-months"
                type="number"
                min="1"
                value={editMonths}
                onChange={(e) =>
                  setEditMonths(
                    e.target.value
                  )
                }
                placeholder="1"
              />
            </div>

            {/* Perks */}

            <div className="space-y-2">
              <Label htmlFor="plan-perks">
                Perks
              </Label>

              <textarea
                id="plan-perks"
                value={editPerks}
                onChange={(e) =>
                  setEditPerks(
                    e.target.value
                  )
                }
                placeholder={
                  "Gym access\nLocker access\nFree consultation"
                }
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />

              <p className="text-xs text-muted-foreground">
                Enter one perk per line.
              </p>
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={
                  savingPlan
                }
                onClick={
                  closeEditPlan
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  savingPlan
                }
                onClick={
                  handleUpdatePlan
                }
              >
                {savingPlan
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}