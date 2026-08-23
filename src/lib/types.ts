export type Role = "ADMIN" | "MEMBER";

export type MembershipStatus = "Active" | "Expiring Soon" | "Expired";
export type PaymentStatus = "Paid" | "Pending" | "Partial";
export type PaymentMethod = "Cash" | "UPI" | "Card" | "Bank Transfer";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  address: string;
  height: number;
  weight: number;
  goal: string;
  experience: Difficulty;
  trainingDays: number;
  plan: string;
  startDate: string;
  expiryDate: string;
  fee: number;
  paymentStatus: PaymentStatus;
  status: MembershipStatus;
}

export interface Plan {
  id: string;
  name: string;
  months: number;
  price: number;
  activeMembers: number;
  perks: string[];
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  amount: number;
  remaining: number;
  method: PaymentMethod;
  status: PaymentStatus;
  plan: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  target: string;
  equipment: string;
  difficulty: Difficulty;
  sets: number;
  reps: string;
  rest: number;
  instructions: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
}

export interface Food {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  audience: Role;
  type: "membership" | "payment" | "workout" | "nutrition" | "achievement";
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  xp: number;
}
