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
} from "@/components/common/ui-kit";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute(
  "/member/membership"
)({
  head: () => ({
    meta: [
      {
        title: "My Membership — Smart Gym",
      },
      {
        name: "description",
        content:
          "View your active membership plan and membership validity.",
      },
      {
        property: "og:title",
        content:
          "My Membership — Smart Gym",
      },
      {
        property: "og:description",
        content:
          "Your current membership plan and validity.",
      },
    ],
  }),

  component: MembershipPage,
});


// ======================================================
// API
// ======================================================

const PROFILE_API_URL =
  "/api/auth/profile";

const TOKEN_KEY =
  "smartgym.token";


// ======================================================
// Types
// ======================================================

type MemberProfile = {
  id: string;

  membershipPlan: string;

  membershipStartDate: string;

  membershipExpiryDate: string;
};


type ProfileResponse = {
  success: boolean;

  user: {
    id: string;

    name: string;

    email: string;

    role: string;

    member: MemberProfile | null;
  };
};


// ======================================================
// Plan perks
// ======================================================

const planPerks: Record<
  string,
  string[]
> = {
  Basic: [
    "Gym access",
    "Access to exercise library",
    "Workout tracking",
  ],

  Standard: [
    "Gym access",
    "Access to exercise library",
    "Workout tracking",
    "Progress tracking",
  ],

  Premium: [
    "Gym access",
    "Access to exercise library",
    "Workout tracking",
    "Progress tracking",
    "Personalized workout support",
  ],

  Annual: [
    "Gym access",
    "Access to exercise library",
    "Workout tracking",
    "Progress tracking",
    "Personalized workout support",
  ],
};


// ======================================================
// Date helpers
// ======================================================

function formatDate(
  dateString: string
) {
  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function calculateDaysRemaining(
  expiryDateString: string
) {
  const today =
    new Date();

  const expiryDate =
    new Date(
      expiryDateString
    );

  if (
    Number.isNaN(
      expiryDate.getTime()
    )
  ) {
    return 0;
  }

  const todayStart =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  const expiryStart =
    new Date(
      expiryDate.getFullYear(),
      expiryDate.getMonth(),
      expiryDate.getDate()
    );

  const difference =
    expiryStart.getTime() -
    todayStart.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}


function calculateTotalDays(
  startDateString: string,
  expiryDateString: string
) {
  const startDate =
    new Date(
      startDateString
    );

  const expiryDate =
    new Date(
      expiryDateString
    );

  if (
    Number.isNaN(
      startDate.getTime()
    ) ||
    Number.isNaN(
      expiryDate.getTime()
    )
  ) {
    return 0;
  }

  const difference =
    expiryDate.getTime() -
    startDate.getTime();

  return Math.max(
    1,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}


// ======================================================
// Membership status
// ======================================================

function getMembershipStatus(
  expiryDateString: string
) {
  const daysRemaining =
    calculateDaysRemaining(
      expiryDateString
    );

  if (
    daysRemaining <= 0
  ) {
    return "Expired";
  }

  if (
    daysRemaining <= 7
  ) {
    return "Expiring Soon";
  }

  return "Active";
}


// ======================================================
// Component
// ======================================================

function MembershipPage() {
  const [member, setMember] =
    useState<MemberProfile | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);


  // ====================================================
  // Fetch real MongoDB member data
  // ====================================================

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            TOKEN_KEY
          );

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const response =
          await fetch(
            PROFILE_API_URL,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          (await response.json()) as ProfileResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            "Failed to fetch membership data"
          );
        }

        if (
          data.user.role !==
          "MEMBER"
        ) {
          throw new Error(
            "Membership information is only available for members"
          );
        }

        if (
          !data.user.member
        ) {
          throw new Error(
            "Member profile not found"
          );
        }

        setMember(
          data.user.member
        );

      } catch (error) {
        console.error(
          "Membership fetch error:",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load membership"
        );

      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);


  // ====================================================
  // Loading state
  // ====================================================

  if (loading) {
    return (
      <>
        <PageHeader
          title="My membership"
          description="Plan details and validity"
        />

        <div className="py-12 text-center text-muted-foreground">
          Loading membership...
        </div>
      </>
    );
  }


  // ====================================================
  // No member profile
  // ====================================================

  if (!member) {
    return (
      <>
        <PageHeader
          title="My membership"
          description="Plan details and validity"
        />

        <div className="py-12 text-center text-muted-foreground">
          Membership information not found.
        </div>
      </>
    );
  }


  // ====================================================
  // Calculate membership information
  // ====================================================

  const daysLeft =
    calculateDaysRemaining(
      member.membershipExpiryDate
    );


  const totalDays =
    calculateTotalDays(
      member.membershipStartDate,
      member.membershipExpiryDate
    );


  const elapsedDays =
    Math.max(
      0,
      totalDays -
        daysLeft
    );


  const progressValue =
    Math.min(
      100,
      Math.max(
        0,
        (elapsedDays /
          totalDays) *
          100
      )
    );


  const status =
    getMembershipStatus(
      member.membershipExpiryDate
    );


  // ====================================================
  // Get plan perks
  // ====================================================

  const perks =
    planPerks[
      member.membershipPlan
    ] ??
    [];


  // ====================================================
  // Render
  // ====================================================

  return (
    <>
      <PageHeader
        title="My membership"
        description="Plan details and validity"
      />


      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2">


        {/* Current plan */}

        <StatCard
          label="Current plan"
          value={
            member.membershipPlan
          }
          icon={IdCard}
          tone="accent"
        />


        {/* Days remaining */}

        <StatCard
          label="Days remaining"
          value={daysLeft}
          icon={CalendarClock}
          tone="info"
        />

      </div>


      {/* ==================================================
          MEMBERSHIP DETAILS
      ================================================== */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">


        {/* ================================================
            VALIDITY CARD
        ================================================ */}

        <Card className="lg:col-span-2">

          <CardHeader>

            <CardTitle className="text-base">
              Membership validity
            </CardTitle>

          </CardHeader>


          <CardContent className="space-y-4">

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">

              <span className="text-muted-foreground">
                Started{" "}

                {formatDate(
                  member.membershipStartDate
                )}
              </span>


              <StatusBadge
                status={status}
              />


              <span className="text-muted-foreground">
                Expires{" "}

                {formatDate(
                  member.membershipExpiryDate
                )}
              </span>

            </div>


            <Progress
              value={
                progressValue
              }
            />


            <p className="text-sm text-muted-foreground">

              {daysLeft > 0
                ? `${daysLeft} of ${totalDays} days remaining on your ${member.membershipPlan} plan.`
                : `Your ${member.membershipPlan} membership has expired.`}

            </p>


            <Button
              onClick={() =>
                toast.success(
                  "Renewal request sent to the front desk"
                )
              }
            >
              Renew membership
            </Button>

          </CardContent>

        </Card>


        {/* ================================================
            PLAN PERKS
        ================================================ */}

        <Card>

          <CardHeader>

            <CardTitle className="text-base">
              Plan perks
            </CardTitle>

          </CardHeader>


          <CardContent>

            <ul className="space-y-2 text-sm">

              {perks.map(
                (perk) => (
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

          </CardContent>

        </Card>

      </div>

    </>
  );
}