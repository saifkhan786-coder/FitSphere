import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { PageHeader, currency } from "@/components/common/ui-kit";
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
import { Textarea } from "@/components/ui/textarea";

import { plans } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/register")({
  head: () => ({
    meta: [
      {
        title: "Register Member — Smart Gym Admin",
      },
      {
        name: "description",
        content:
          "Onboard a new gym member with personal, fitness and membership details.",
      },
      {
        property: "og:title",
        content: "Register Member — Smart Gym Admin",
      },
      {
        property: "og:description",
        content:
          "Onboard a new gym member in a single guided form.",
      },
    ],
  }),

  component: RegisterPage,
});

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RegisterPage() {
  // -----------------------------------------
  // Membership plan
  // -----------------------------------------

  const [planId, setPlanId] = useState(
    plans[1]?.id ?? plans[0]?.id ?? ""
  );

  // -----------------------------------------
  // Select values
  // -----------------------------------------

  const [gender, setGender] =
    useState("Male");

  const [primaryGoal, setPrimaryGoal] =
    useState("Muscle Gain");

  const [experienceLevel, setExperienceLevel] =
    useState("Beginner");

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  // -----------------------------------------
  // Loading state
  // -----------------------------------------

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // -----------------------------------------
  // Selected plan
  // -----------------------------------------

  const selectedPlan =
    plans.find(
      (p) => p.id === planId
    ) ?? plans[0];

  // -----------------------------------------
  // Submit
  // -----------------------------------------

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!selectedPlan) {
      toast.error(
        "Please select a membership plan"
      );

      return;
    }

    const form = e.currentTarget;

    try {
      setIsSubmitting(true);

      // ---------------------------------------
      // Read normal input fields
      // ---------------------------------------

      const formData =
        new FormData(form);

      const data =
        Object.fromEntries(
          formData
        ) as Record<
          string,
          FormDataEntryValue
        >;

      // ---------------------------------------
      // Build member data
      // ---------------------------------------

      const memberData = {
        name: String(
          data["name"] ?? ""
        ),

        email: String(
          data["email"] ?? ""
        ),

        password: String(
          data["password"] ?? ""
        ),

        phone: String(
          data["phone"] ?? ""
        ),

        gender,

        dateOfBirth: String(
          data["dateOfBirth"] ?? ""
        ),

        emergencyContact:
          String(
            data["emergencyContact"] ?? ""
          ),

        address: String(
          data["address"] ?? ""
        ),

        height: Number(
          data["height"] ?? 0
        ),

        weight: Number(
          data["weight"] ?? 0
        ),

        primaryGoal,

        experienceLevel,

        trainingDaysPerWeek:
          Number(
            data[
              "trainingDaysPerWeek"
            ] ?? 0
          ),

        medicalNotes:
          String(
            data["medicalNotes"] ?? ""
          ),

        membershipPlan:
          selectedPlan.name,

        membershipStartDate:
          String(
            data[
              "membershipStartDate"
            ] ?? ""
          ),

        paymentMethod,

        amountPaid:
          Number(
            data["amountPaid"] ?? 0
          ),
      };

      console.log(
        "Member data:",
        memberData
      );

      // ---------------------------------------
      // Get admin token
      // ---------------------------------------

      const token =
        localStorage.getItem(
          "smartgym.token"
        );

      if (!token) {
        toast.error(
          "Admin login required"
        );

        return;
      }

      // ---------------------------------------
      // Send request
      // ---------------------------------------

      const response =
        await fetch(
          "http://localhost:5000/api/auth/admin/create-member",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(
              memberData
            ),
          }
        );

      // ---------------------------------------
      // Read backend response
      // ---------------------------------------

      const result =
        await response.json();

      console.log(
        "API result:",
        result
      );

      // ---------------------------------------
      // Handle backend error
      // ---------------------------------------

      if (
        !response.ok ||
        !result.success
      ) {
        toast.error(
          result.message ||
            "Failed to register member"
        );

        return;
      }

      // ---------------------------------------
      // Success
      // ---------------------------------------

      toast.success(
        "Member registered successfully",
        {
          description:
            "The member has been added to the roster.",
        }
      );

      // Reset normal inputs
      form.reset();

      // Reset Select values
      setGender("Male");

      setPrimaryGoal(
        "Muscle Gain"
      );

      setExperienceLevel(
        "Beginner"
      );

      setPaymentMethod("UPI");

      setPlanId(
        plans[1]?.id ??
          plans[0]?.id ??
          ""
      );

    } catch (error) {
      console.error(
        "Register member error:",
        error
      );

      toast.error(
        "Something went wrong while registering the member"
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* ===================================== */}
      {/* PAGE HEADER */}
      {/* ===================================== */}

      <PageHeader
        title="Register new member"
        description="Capture personal, fitness and membership information"
      />

      {/* ===================================== */}
      {/* FORM */}
      {/* ===================================== */}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-3"
      >
        {/* ================================= */}
        {/* LEFT SIDE */}
        {/* ================================= */}

        <div className="space-y-4 lg:col-span-2">

          {/* ================================= */}
          {/* PERSONAL DETAILS */}
          {/* ================================= */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Personal details
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">

              {/* Full name */}

              <Field label="Full name">
                <Input
                  name="name"
                  required
                  placeholder="Rahul Sharma"
                />
              </Field>

              {/* Email */}

              <Field label="Email">
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="rahul@example.com"
                />
              </Field>

              {/* Password */}

              <Field label="Password">
                <Input
                  name="password"
                  type="password"
                  required
                  placeholder="Create member password"
                />
              </Field>

              {/* Phone */}

              <Field label="Phone">
                <Input
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                />
              </Field>

              {/* Gender */}

              <Field label="Gender">
                <Select
                  value={gender}
                  onValueChange={setGender}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Male">
                      Male
                    </SelectItem>

                    <SelectItem value="Female">
                      Female
                    </SelectItem>

                    <SelectItem value="Other">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Date of birth */}

              <Field label="Date of birth">
                <Input
                  name="dateOfBirth"
                  type="date"
                  required
                />
              </Field>

              {/* Emergency contact */}

              <Field label="Emergency contact">
                <Input
                  name="emergencyContact"
                  placeholder="+91 90000 00000"
                />
              </Field>

              {/* Address */}

              <div className="sm:col-span-2">
                <Field label="Address">
                  <Textarea
                    name="address"
                    rows={2}
                    placeholder="Street, area, city"
                  />
                </Field>
              </div>

            </CardContent>
          </Card>

          {/* ================================= */}
          {/* FITNESS PROFILE */}
          {/* ================================= */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Fitness profile
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">

              {/* Height */}

              <Field label="Height (cm)">
                <Input
                  name="height"
                  type="number"
                  defaultValue={172}
                />
              </Field>

              {/* Weight */}

              <Field label="Weight (kg)">
                <Input
                  name="weight"
                  type="number"
                  defaultValue={68}
                />
              </Field>

              {/* Primary goal */}

              <Field label="Primary goal">
                <Select
                  value={primaryGoal}
                  onValueChange={
                    setPrimaryGoal
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Muscle Gain">
                      Muscle Gain
                    </SelectItem>

                    <SelectItem value="Weight Loss">
                      Weight Loss
                    </SelectItem>

                    <SelectItem value="Maintenance">
                      Maintenance
                    </SelectItem>

                    <SelectItem value="Endurance">
                      Endurance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Experience */}

              <Field label="Experience level">
                <Select
                  value={experienceLevel}
                  onValueChange={
                    setExperienceLevel
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Beginner">
                      Beginner
                    </SelectItem>

                    <SelectItem value="Intermediate">
                      Intermediate
                    </SelectItem>

                    <SelectItem value="Advanced">
                      Advanced
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Training days */}

              <Field label="Training days / week">
                <Input
                  name="trainingDaysPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  defaultValue={4}
                />
              </Field>

              {/* Medical notes */}

              <Field label="Medical notes">
                <Input
                  name="medicalNotes"
                  placeholder="None"
                />
              </Field>

            </CardContent>
          </Card>
        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="space-y-4">

          {/* ================================= */}
          {/* MEMBERSHIP */}
          {/* ================================= */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Membership
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* Plan */}

              <Field label="Plan">
                <Select
                  value={planId}
                  onValueChange={setPlanId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                      >
                        {p.name} ·{" "}
                        {p.months} month
                        {p.months > 1
                          ? "s"
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Start date */}

              <Field label="Start date">
                <Input
                  name="membershipStartDate"
                  type="date"
                  defaultValue={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                />
              </Field>

              {/* Payment method */}

              <Field label="Payment method">
                <Select
                  value={paymentMethod}
                  onValueChange={
                    setPaymentMethod
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Cash">
                      Cash
                    </SelectItem>

                    <SelectItem value="UPI">
                      UPI
                    </SelectItem>

                    <SelectItem value="Card">
                      Card
                    </SelectItem>

                    <SelectItem value="Bank Transfer">
                      Bank Transfer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Amount paid */}

              <Field label="Amount paid">
                <Input
                  name="amountPaid"
                  type="number"
                  min={0}
                  defaultValue={
                    selectedPlan?.price ??
                    0
                  }
                />
              </Field>

              {/* Plan summary */}

              <div className="rounded-xl bg-secondary p-4">

                <p className="text-sm text-muted-foreground">
                  Total due
                </p>

                <p className="font-display text-2xl font-semibold">
                  {currency(
                    selectedPlan?.price ??
                      0
                  )}
                </p>

                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {(
                    selectedPlan?.perks ??
                    []
                  ).map((perk) => (
                    <li key={perk}>
                      • {perk}
                    </li>
                  ))}
                </ul>

              </div>

              {/* Register button */}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Registering..."
                  : "Register member"}
              </Button>

            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}