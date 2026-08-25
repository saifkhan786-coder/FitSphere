import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, StatusBadge, currency } from "@/components/common/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { members } from "@/lib/mock-data";
import type { Member } from "@/lib/types";

export const Route = createFileRoute("/admin/members")({
  head: () => ({
    meta: [
      { title: "Members — Smart Gym Admin" },
      { name: "description", content: "Search, filter and manage every gym member, plan and membership status." },
      { property: "og:title", content: "Members — Smart Gym Admin" },
      { property: "og:description", content: "Search, filter and manage every gym member and membership." },
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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Member | null>(null);

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const q = query.toLowerCase();
        const matchQ = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.phone.includes(q);
        return matchQ && (status === "all" || m.status === status) && (plan === "all" || m.plan === plan);
      }),
    [query, status, plan],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Members"
        description={`${filtered.length} of ${members.length} members shown`}
        action={
          <Button asChild>
            <Link to="/admin/register">
              <UserPlus className="mr-2 size-4" /> New member
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
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
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
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
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
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-secondary text-xs">{initials(m.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.phone}</TableCell>
                    <TableCell>{m.plan}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.expiryDate}</TableCell>
                    <TableCell>
                      <StatusBadge status={m.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(m)}>
                        <Eye className="size-4" />
                        <span className="sr-only">View {m.name}</span>
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
              <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Member ID", selected.id],
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["Gender", selected.gender],
                ["Date of birth", selected.dob],
                ["Height / Weight", `${selected.height} cm · ${selected.weight} kg`],
                ["Goal", selected.goal],
                ["Experience", selected.experience],
                ["Training days", `${selected.trainingDays} / week`],
                ["Plan", `${selected.plan} · ${currency(selected.fee)}`],
                ["Start date", selected.startDate],
                ["Expiry date", selected.expiryDate],
                ["Address", selected.address],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-0.5 font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
