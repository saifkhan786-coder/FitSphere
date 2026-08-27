import { createFileRoute } from "@tanstack/react-router";
import { Download, IndianRupee, Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatCard, StatusBadge, currency } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { members, payments } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Smart Gym Admin" },
      { name: "description", content: "Track collected fees, pending dues and record new gym payments." },
      { property: "og:title", content: "Payments — Smart Gym Admin" },
      { property: "og:description", content: "Track collected fees, pending dues and record payments." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => payments.filter((p) => status === "all" || p.status === status), [status]);
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = payments.reduce((s, p) => s + p.remaining, 0);

  return (
    <>
      <PageHeader
        title="Payments"
        description="Fee collection and outstanding dues"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("Invoice export queued")}>
              <Download className="mr-2 size-4" /> Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 size-4" /> Record payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record payment</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    toast.success("Payment recorded");
                  }}
                >
                  <div className="space-y-2">
                    <Label>Member</Label>
                    <Select defaultValue={members[0]!.id}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {members.slice(0, 12).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} · {m.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input type="number" defaultValue={2700} />
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select defaultValue="UPI">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" defaultValue="2026-08-25" />
                  </div>
                  <Button type="submit" className="w-full">
                    Save payment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected this month" value={currency(collected)} icon={IndianRupee} tone="success" />
        <StatCard label="Outstanding dues" value={currency(outstanding)} icon={Wallet} tone="warning" />
        <StatCard label="Transactions" value={payments.length} icon={Download} />
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 p-5">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.memberName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.date}</TableCell>
                    <TableCell>{p.plan}</TableCell>
                    <TableCell>{currency(p.amount)}</TableCell>
                    <TableCell className={p.remaining > 0 ? "text-destructive" : "text-muted-foreground"}>
                      {currency(p.remaining)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.method}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
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
