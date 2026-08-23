import {
  Activity,
  Apple,
  BarChart3,
  Bell,
  Bot,
  CalculatorIcon,
  CreditCard,
  Dumbbell,
  IdCard,
  LayoutDashboard,
  LineChart,
  QrCode,
  Settings,
  Trophy,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "New Member", to: "/admin/register", icon: UserPlus },
  { label: "Memberships", to: "/admin/memberships", icon: IdCard },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Attendance", to: "/admin/attendance", icon: QrCode },
  { label: "Exercises", to: "/admin/exercises", icon: Dumbbell },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export const memberNav: NavItem[] = [
  { label: "Home", to: "/member", icon: LayoutDashboard },
  { label: "Workout", to: "/member/workout", icon: Dumbbell },
  { label: "Exercise Library", to: "/member/exercises", icon: Activity },
  { label: "Nutrition", to: "/member/nutrition", icon: Apple },
  { label: "Calorie Calculator", to: "/member/calculator", icon: CalculatorIcon },
  { label: "Progress", to: "/member/progress", icon: LineChart },
  { label: "Attendance", to: "/member/attendance", icon: QrCode },
  { label: "Membership", to: "/member/membership", icon: IdCard },
  { label: "Achievements", to: "/member/achievements", icon: Trophy },
  { label: "AI Coach", to: "/member/coach", icon: Bot },
  { label: "Profile", to: "/member/profile", icon: User },
];

export function navForRole(role: Role) {
  return role === "ADMIN" ? adminNav : memberNav;
}
