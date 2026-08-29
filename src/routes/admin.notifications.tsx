import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/common/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notifications as seedNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Smart Gym Admin" },
      { name: "description", content: "Gym alerts for renewals and payments plus broadcast announcements to members." },
      { property: "og:title", content: "Notifications — Smart Gym Admin" },
      { property: "og:description", content: "Alerts and member broadcast announcements." },
    ],
  }),
  component: AdminNotifications,
});

function AdminNotifications() {
  const [items, setItems] = useState(seedNotifications.filter((n) => n.audience === "ADMIN"));
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unread} unread alert${unread === 1 ? "" : "s"}`}
        action={
          <Button variant="outline" onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}>
            <CheckCheck className="mr-2 size-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          ) : (
            items.map((n) => (
              <Card key={n.id} className={cn(!n.read && "border-accent/40 bg-accent/5")}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Bell className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      <Badge variant="secondary" className="capitalize">
                        {n.type}
                      </Badge>
                      {!n.read && <span className="size-2 rounded-full bg-accent" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                  {!n.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                    >
                      Mark read
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Broadcast announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                (e.target as HTMLFormElement).reset();
                toast.success("Announcement sent to all members");
              }}
            >
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required placeholder="Holiday timings update" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea required rows={5} placeholder="Write your announcement…" />
              </div>
              <Button type="submit" className="w-full">
                <Send className="mr-2 size-4" /> Send to members
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
