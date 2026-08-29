import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smart Gym Admin" },
      { name: "description", content: "Configure gym profile, operating hours, billing preferences and alerts." },
      { property: "og:title", content: "Settings — Smart Gym Admin" },
      { property: "og:description", content: "Gym profile, hours, billing and alert preferences." },
    ],
  }),
  component: SettingsPage,
});

function ToggleRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Gym profile and system preferences" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gym profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Gym profile updated");
              }}
            >
              <div className="space-y-2">
                <Label>Gym name</Label>
                <Input defaultValue="Smart Gym Fitness Studio" />
              </div>
              <div className="space-y-2">
                <Label>Contact email</Label>
                <Input type="email" defaultValue="hello@smartgym.in" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 98220 44120" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="INR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue="Plot 21, FC Road, Pune, Maharashtra" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opens at</Label>
                  <Input type="time" defaultValue="05:30" />
                </div>
                <div className="space-y-2">
                  <Label>Closes at</Label>
                  <Input type="time" defaultValue="22:30" />
                </div>
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border py-0">
              <ToggleRow label="Membership expiry alerts" description="Notify 7 days before expiry" defaultChecked />
              <ToggleRow label="Payment reminders" description="Automatic dues reminders every Monday" defaultChecked />
              <ToggleRow label="New member welcome email" description="Send onboarding email on registration" defaultChecked />
              <ToggleRow label="Daily attendance summary" description="Email digest at 11 PM" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border py-0">
              <ToggleRow label="QR check-in" description="Allow members to self check-in via QR" defaultChecked />
              <ToggleRow label="AI Coach" description="Enable the member AI fitness assistant" defaultChecked />
              <ToggleRow label="Gamification" description="Achievements, XP and leaderboard" defaultChecked />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export all gym data or reset demo records. These actions apply to mock data only.
              </p>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast.success("Data export queued")}>
                  Export data
                </Button>
                <Button variant="destructive" onClick={() => toast.info("Demo data reset")}>
                  Reset demo data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
