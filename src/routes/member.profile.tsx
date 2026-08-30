import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/common/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { members } from "@/lib/mock-data";

export const Route = createFileRoute("/member/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Smart Gym" },
      { name: "description", content: "Update your personal details, body stats, training goal and account password." },
      { property: "og:title", content: "My Profile — Smart Gym" },
      { property: "og:description", content: "Personal details, body stats and training goals." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const me = members[0]!;

  return (
    <>
      <PageHeader title="My profile" description="Personal details and fitness preferences" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">RS</AvatarFallback>
            </Avatar>
            <p className="mt-4 font-display text-lg font-semibold">{me.name}</p>
            <p className="text-sm text-muted-foreground">{me.email}</p>
            <div className="mt-3">
              <StatusBadge status={me.status} />
            </div>
            <Separator className="my-5" />
            <dl className="w-full space-y-2 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Member ID</dt>
                <dd className="font-medium">{me.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium">{me.plan}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Goal</dt>
                <dd className="font-medium">{me.goal}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Experience</dt>
                <dd className="font-medium">{me.experience}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal details</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Profile updated");
                }}
              >
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input defaultValue={me.name} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue={me.email} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue={me.phone} />
                </div>
                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Input type="date" defaultValue={me.dob} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Input defaultValue={me.address} />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" defaultValue={me.height} />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" defaultValue={me.weight} />
                </div>
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Select defaultValue={me.goal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={me.goal}>{me.goal}</SelectItem>
                      <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                      <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                      <SelectItem value="General Fitness">General Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Training days / week</Label>
                  <Input type="number" defaultValue={me.trainingDays} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change password</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Password updated");
                }}
              >
                <div className="space-y-2">
                  <Label>Current password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="outline">
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
