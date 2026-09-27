import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHeader, StatusBadge, currency } from "@/components/common/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Member } from "@/lib/types";

export const Route = createFileRoute("/admin/members")({
  head: () => ({
    meta: [
      { title: "Members — Smart Gym Admin" },
      {
        name: "description",
        content:
          "Search, filter and manage every gym member, plan and membership status.",
      },
      {
        property: "og:title",
        content: "Members — Smart Gym Admin",
      },
      {
        property: "og:description",
        content:
          "Search, filter and manage every gym member and membership.",
      },
    ],
  }),
  component: MembersPage,
});

const PAGE_SIZE = 8;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Member | null>(null);

  // Edit membership states
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editPlan, setEditPlan] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("smartgym.token");

    fetch("http://localhost:5000/api/auth/admin/members", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Members API result:", data);

        if (!data.success) {
          console.error("Failed to load members:", data.message);
          return;
        }

        const formattedMembers: Member[] = data.members.map(
          (member: any) => ({
            id: member._id,
            name: member.name,
            email: "—",
            phone: member.phone || "—",
            gender: member.gender || "Other",

            dob: member.dateOfBirth
              ? new Date(member.dateOfBirth).toLocaleDateString()
              : "—",

            address: member.address || "—",
            height: member.height || 0,
            weight: member.weight || 0,
            goal: member.primaryGoal || "—",
            experience: member.experienceLevel || "Beginner",
            trainingDays: member.trainingDaysPerWeek || 0,

            plan: member.membershipPlan || "—",

            startDate: member.membershipStartDate
            ? new Date(member.membershipStartDate)
            .toISOString()
            .split("T")[0]
            : "",

            expiryDate: member.membershipExpiryDate
              ? new Date(member.membershipExpiryDate).toLocaleDateString()
              : "—",

            fee: member.amountPaid || 0,

            paymentStatus:
              member.amountPaid && member.amountPaid > 0
                ? "Paid"
                : "Pending",

            status:
              new Date(member.membershipExpiryDate) < new Date()
                ? "Expired"
                : new Date(member.membershipExpiryDate) <=
                    new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    )
                  ? "Expiring Soon"
                  : "Active",
          })
        );

        setMembers(formattedMembers);
      })
      .catch((error) => {
        console.error("Members API error:", error);
      });
  }, []);

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const q = query.toLowerCase();

        const matchQ =
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q);

        const matchStatus =
          status === "all" || m.status === status;

        const matchPlan =
          plan === "all" || m.plan === plan;

        return matchQ && matchStatus && matchPlan;
      }),
    [query, status, plan, members]
  );

  const pages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const current = Math.min(page, pages);

  const rows = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  return (
    <>
      <PageHeader
        title="Members"
        description={`${filtered.length} of ${members.length} members shown`}
        action={
          <Button asChild>
            <Link to="/admin/register">
              <UserPlus className="mr-2 size-4" />
              New member
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, ID or phone"
                className="pl-9"
              />
            </div>

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All statuses
                </SelectItem>

                <SelectItem value="Active">
                  Active
                </SelectItem>

                <SelectItem value="Expiring Soon">
                  Expiring Soon
                </SelectItem>

                <SelectItem value="Expired">
                  Expired
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={plan}
              onValueChange={(v) => {
                setPlan(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All plans
                </SelectItem>

                <SelectItem value="Basic">
                  Basic
                </SelectItem>

                <SelectItem value="Standard">
                  Standard
                </SelectItem>

                <SelectItem value="Premium">
                  Premium
                </SelectItem>

                <SelectItem value="Annual">
                  Annual
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-secondary text-xs">
                            {initials(m.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="font-medium">
                            {m.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {m.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {m.phone}
                    </TableCell>

                    <TableCell>
                      {m.plan}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {m.expiryDate}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={m.paymentStatus} />
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      {/* View button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelected(m)}
                      >
                        <Eye className="size-4" />

                        <span className="sr-only">
                          View {m.name}
                        </span>
                      </Button>

                      {/* Edit button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingMember(m);
                          setEditStartDate(m.startDate);
                          setEditPlan(
  ["Basic", "Standard", "Premium", "Annual"].includes(m.plan)
    ? m.plan
    : "Basic"
);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {current} of {pages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(o) =>
          !o && setSelected(null)
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selected?.name}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Member ID", selected.id],
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["Gender", selected.gender],
                ["Date of birth", selected.dob],
                [
                  "Height / Weight",
                  `${selected.height} cm · ${selected.weight} kg`,
                ],
                ["Goal", selected.goal],
                ["Experience", selected.experience],
                [
                  "Training days",
                  `${selected.trainingDays} / week`,
                ],
                [
                  "Plan",
                  `${selected.plan} · ${currency(selected.fee)}`,
                ],
                ["Start date", selected.startDate],
                ["Expiry date", selected.expiryDate],
                ["Address", selected.address],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">
                    {label}
                  </p>

                  <p className="mt-0.5 font-medium">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
  open={!!editingMember}
  onOpenChange={(open) => {
    if (!open) {
      setEditingMember(null);
    }
  }}
>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>
        Edit Membership
      </DialogTitle>
    </DialogHeader>

    {editingMember && (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium">
            Member
          </p>

          <p className="text-sm text-muted-foreground">
            {editingMember.name}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Entry Date
          </label>

          <Input
            type="date"
            value={editStartDate}
            onChange={(e) =>
              setEditStartDate(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Membership Plan
          </label>

          <Select
            value={editPlan}
            onValueChange={setEditPlan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Basic">
                Basic
              </SelectItem>

              <SelectItem value="Standard">
                Standard
              </SelectItem>

              <SelectItem value="Premium">
                Premium
              </SelectItem>

              <SelectItem value="Annual">
                Annual
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setEditingMember(null)}
          >
            Cancel
          </Button>

          <Button
  onClick={async () => {
    const token = localStorage.getItem("smartgym.token");

    const response = await fetch(
      `http://localhost:5000/api/auth/admin/members/${editingMember?.id}/membership`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          membershipStartDate: editStartDate,
          membershipPlan: editPlan,
        }),
      }
    );

    const data = await response.json();

    console.log("Membership update result:", data);

    if (data.success) {
  setEditingMember(null);
  window.location.reload();
}
  }}
>
  Save Changes
</Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </>
  );
}