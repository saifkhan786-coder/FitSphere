import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, StatusBadge } from "@/components/common/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/member/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Smart Gym" },
      {
        name: "description",
        content:
          "Update your personal details, body stats, training goal and account password.",
      },
      {
        property: "og:title",
        content: "My Profile — Smart Gym",
      },
      {
        property: "og:description",
        content: "Personal details, body stats and training goals.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("smartgym.token");

    fetch("http://localhost:5000/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user);
      });
  }, []);

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <>
      <PageHeader
        title="My profile"
        description="Personal details and fitness preferences"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {profile.name
                  .split(" ")
                  .map((word: string) => word[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <p className="mt-4 font-display text-lg font-semibold">
              {profile.name}
            </p>

            <p className="text-sm text-muted-foreground">
              {profile.email}
            </p>

            <div className="mt-3">
              <StatusBadge status="Active" />
            </div>

            <Separator className="my-5" />

            <dl className="w-full space-y-2 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Member ID
                </dt>

                <dd className="font-medium">
                  {profile.id}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Plan
                </dt>

                <dd className="font-medium">
                  {profile.member?.membershipPlan}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Goal
                </dt>

                <dd className="font-medium">
                  {profile.member?.primaryGoal}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Experience
                </dt>

                <dd className="font-medium">
                  {profile.member?.experienceLevel}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Personal details
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();

                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData);

                  const token =
                    localStorage.getItem("smartgym.token");

                  const response = await fetch(
                    "http://localhost:5000/api/auth/profile",
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(data),
                    }
                  );

                  const result = await response.json();

                  if (result.success) {
                    toast.success(
                      "Profile updated successfully"
                    );

                    setProfile((current: any) => ({
                      ...current,
                      name: data["name"] || current.name,
                      email: data["email"] || current.email,
                      member: {
                        ...current.member,
                        ...data,
                      },
                    }));
                  } else {
                    toast.error(
                      result.message || "Profile update failed"
                    );
                  }
                }}
              >
                <div className="space-y-2">
                  <Label>Full name</Label>

                  <Input
                    name="name"
                    defaultValue={profile.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>

                  <Input
                    name="email"
                    type="email"
                    defaultValue={profile.email}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>

                  <Input
                    name="phone"
                    defaultValue={profile.member?.phone}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of birth</Label>

                  <Input
                    name="dateOfBirth"
                    type="date"
                    defaultValue={profile.member?.dateOfBirth?.slice(
                      0,
                      10
                    )}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>

                  <Input
                    name="address"
                    defaultValue={profile.member?.address}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height (cm)</Label>

                  <Input
                    name="height"
                    type="number"
                    defaultValue={profile.member?.height}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weight (kg)</Label>

                  <Input
                    name="weight"
                    type="number"
                    defaultValue={profile.member?.weight}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Goal</Label>

                  <Select
                    name="primaryGoal"
                    defaultValue={profile.member?.primaryGoal}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Weight Loss">
                        Weight Loss
                      </SelectItem>

                      <SelectItem value="Muscle Gain">
                        Muscle Gain
                      </SelectItem>

                      <SelectItem value="General Fitness">
                        General Fitness
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Training days / week</Label>

                  <Input
                    name="trainingDaysPerWeek"
                    type="number"
                    defaultValue={
                      profile.member?.trainingDaysPerWeek
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit">
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Change password
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();

                  const formData = new FormData(
                    e.currentTarget
                  );

                  const data = Object.fromEntries(formData);

                  const token =
                    localStorage.getItem("smartgym.token");

                  const response = await fetch(
                    "http://localhost:5000/api/auth/change-password",
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(data),
                    }
                  );

                  const result = await response.json();

                  if (result.success) {
                    toast.success(
                      "Password changed successfully"
                    );

                    e.currentTarget.reset();
                  } else {
                    toast.error(
                      result.message ||
                        "Password change failed"
                    );
                  }
                }}
              >
                <div className="space-y-2">
                  <Label>Current password</Label>

                  <Input
                    name="currentPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label>New password</Label>

                  <Input
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    variant="outline"
                  >
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