import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, currency } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { plans } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/register")({
  head: () => ({
    meta: [
      { title: "Register Member — Smart Gym Admin" },
      { name: "description", content: "Onboard a new gym member with personal, fitness and membership details." },
      { property: "og:title", content: "Register Member — Smart Gym Admin" },
      { property: "og:description", content: "Onboard a new gym member in a single guided form." },
    ],
  }),
  component: RegisterPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RegisterPage() {
  const [planId, setPlanId] = useState(plans[1]!.id);
  const selectedPlan = plans.find((p) => p.id === planId)!;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Member registered", { description: "The member has been added to the roster." });
    e.currentTarget.reset();
  }

  return (
    <>
      <PageHeader title="Register new member" description="Capture personal, fitness and membership information" />

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input required placeholder="Rahul Sharma" />
              </Field>
              <Field label="Email">
                <Input type="email" required placeholder="rahul@example.com" />
              </Field>
              <Field label="Phone">
                <Input required placeholder="+91 98765 43210" />
              </Field>
              <Field label="Gender">
                <Select defaultValue="Male">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date of birth">
                <Input type="date" required />
              </Field>
              <Field label="Emergency contact">
                <Input placeholder="+91 90000 00000" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Textarea rows={2} placeholder="Street, area, city" />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fitness profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Height (cm)">
                <Input type="number" defaultValue={172} />
              </Field>
              <Field label="Weight (kg)">
                <Input type="number" defaultValue={68} />
              </Field>
              <Field label="Primary goal">
                <Select defaultValue="Muscle Gain">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                    <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Endurance">Endurance</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Experience level">
                <Select defaultValue="Beginner">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Training days / week">
                <Input type="number" min={1} max={7} defaultValue={4} />
              </Field>
              <Field label="Medical notes">
                <Input placeholder="None" />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Membership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Plan">
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · {p.months} month{p.months > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Start date">
                <Input type="date" defaultValue="2026-08-25" />
              </Field>
              <Field label="Payment method">
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
              </Field>
              <Field label="Amount paid">
                <Input type="number" defaultValue={selectedPlan.price} />
              </Field>

              <div className="rounded-xl bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Total due</p>
                <p className="font-display text-2xl font-semibold">{currency(selectedPlan.price)}</p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {selectedPlan.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
              </div>

              <Button type="submit" className="w-full">
                Register member
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}
