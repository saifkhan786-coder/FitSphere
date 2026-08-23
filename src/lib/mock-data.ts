import type {
  Achievement,
  AppNotification,
  Exercise,
  Food,
  Member,
  Payment,
  Plan,
  WorkoutExercise,
} from "./types";

export const CURRENCY = "₹";

export const plans: Plan[] = [
  {
    id: "p1",
    name: "Basic",
    months: 1,
    price: 1000,
    activeMembers: 62,
    perks: ["Gym floor access", "Locker", "1 trainer session"],
  },
  {
    id: "p2",
    name: "Standard",
    months: 3,
    price: 2700,
    activeMembers: 84,
    perks: ["Everything in Basic", "Group classes", "Diet chart"],
  },
  {
    id: "p3",
    name: "Premium",
    months: 6,
    price: 5000,
    activeMembers: 71,
    perks: ["Everything in Standard", "Personal trainer", "Body composition scan"],
  },
  {
    id: "p4",
    name: "Annual",
    months: 12,
    price: 9000,
    activeMembers: 33,
    perks: ["Everything in Premium", "Free supplements kit", "Guest passes"],
  },
];

const firstNames = [
  "Rahul",
  "Aman",
  "Sameer",
  "Priya",
  "Neha",
  "Vikram",
  "Ananya",
  "Karan",
  "Ishita",
  "Rohan",
  "Meera",
  "Arjun",
  "Divya",
  "Nikhil",
  "Sneha",
  "Aditya",
  "Pooja",
  "Manish",
  "Tanvi",
  "Harsh",
  "Kavya",
  "Yash",
  "Riya",
  "Siddharth",
  "Ritu",
  "Gaurav",
  "Simran",
  "Varun",
];
const lastNames = ["Sharma", "Verma", "Patel", "Nair", "Iyer", "Singh", "Gupta", "Reddy"];
const goals = ["Muscle Gain", "Weight Loss", "Maintenance", "Endurance"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export const members: Member[] = Array.from({ length: 28 }).map((_, i) => {
  const plan = plans[i % plans.length]!;
  const startMonth = (i % 10) + 1;
  const start = `2026-${pad(startMonth)}-${pad((i % 27) + 1)}`;
  const expMonth = ((startMonth + plan.months - 1) % 12) + 1;
  const expiry = `2026-${pad(expMonth)}-${pad((i % 27) + 1)}`;
  const status = i % 9 === 0 ? "Expired" : i % 5 === 0 ? "Expiring Soon" : "Active";
  const paymentStatus = i % 7 === 0 ? "Pending" : i % 4 === 0 ? "Partial" : "Paid";
  return {
    id: `M-${1000 + i}`,
    name: `${firstNames[i % firstNames.length]!} ${lastNames[i % lastNames.length]!}`,
    email: `${firstNames[i % firstNames.length]!.toLowerCase()}${i}@smartgym.in`,
    phone: `+91 9${String(800000000 + i * 137711).slice(0, 9)}`,
    gender: i % 3 === 1 ? "Female" : "Male",
    dob: `199${i % 10}-0${(i % 9) + 1}-1${i % 9}`,
    address: `${12 + i} Fitness Street, Sector ${i % 20}, Pune`,
    height: 158 + (i % 25),
    weight: 52 + (i % 38),
    goal: goals[i % goals.length]!,
    experience: i % 3 === 0 ? "Beginner" : i % 3 === 1 ? "Intermediate" : "Advanced",
    trainingDays: 3 + (i % 4),
    plan: plan.name,
    startDate: start,
    expiryDate: expiry,
    fee: plan.price,
    paymentStatus,
    status,
  } satisfies Member;
});

export const payments: Payment[] = members.slice(0, 20).map((m, i) => ({
  id: `PAY-${2200 + i}`,
  memberId: m.id,
  memberName: m.name,
  date: `2026-08-${pad((i % 22) + 1)}`,
  amount: m.paymentStatus === "Partial" ? Math.round(m.fee / 2) : m.fee,
  remaining: m.paymentStatus === "Partial" ? Math.round(m.fee / 2) : m.paymentStatus === "Pending" ? m.fee : 0,
  method: (["Cash", "UPI", "Card", "Bank Transfer"] as const)[i % 4]!,
  status: m.paymentStatus,
  plan: m.plan,
}));

export const revenueTrend = [
  { month: "Mar", revenue: 78000, members: 182 },
  { month: "Apr", revenue: 86500, members: 196 },
  { month: "May", revenue: 94000, members: 205 },
  { month: "Jun", revenue: 102500, members: 219 },
  { month: "Jul", revenue: 114000, members: 236 },
  { month: "Aug", revenue: 125000, members: 250 },
];

export const attendanceTrend = [
  { day: "Mon", present: 168, absent: 82 },
  { day: "Tue", present: 182, absent: 68 },
  { day: "Wed", present: 174, absent: 76 },
  { day: "Thu", present: 191, absent: 59 },
  { day: "Fri", present: 205, absent: 45 },
  { day: "Sat", present: 148, absent: 102 },
  { day: "Sun", present: 83, absent: 167 },
];

export const exerciseCategories = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Abs",
  "Cardio",
];

export const exercises: Exercise[] = [
  {
    id: "e1",
    name: "Bench Press",
    category: "Chest",
    target: "Pectoralis Major",
    equipment: "Barbell",
    difficulty: "Intermediate",
    sets: 4,
    reps: "8-10",
    rest: 60,
    instructions: [
      "Lie flat on the bench with feet planted firmly.",
      "Grip the bar slightly wider than shoulder width.",
      "Lower the bar to mid-chest with control.",
      "Press back up to the starting position.",
    ],
  },
  {
    id: "e2",
    name: "Incline Dumbbell Press",
    category: "Chest",
    target: "Upper Chest",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    sets: 3,
    reps: "10-12",
    rest: 60,
    instructions: ["Set bench to 30 degrees.", "Press dumbbells up and slightly inward.", "Lower slowly."],
  },
  {
    id: "e3",
    name: "Cable Fly",
    category: "Chest",
    target: "Inner Chest",
    equipment: "Cable Machine",
    difficulty: "Beginner",
    sets: 3,
    reps: "12-15",
    rest: 45,
    instructions: ["Set pulleys at shoulder height.", "Bring handles together in an arc.", "Squeeze and return."],
  },
  {
    id: "e4",
    name: "Push-ups",
    category: "Chest",
    target: "Chest & Core",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    sets: 3,
    reps: "To failure",
    rest: 45,
    instructions: ["Keep body in a straight line.", "Lower until chest nearly touches floor.", "Press up."],
  },
  {
    id: "e5",
    name: "Deadlift",
    category: "Back",
    target: "Posterior Chain",
    equipment: "Barbell",
    difficulty: "Advanced",
    sets: 4,
    reps: "5-6",
    rest: 120,
    instructions: ["Hinge at the hips with a neutral spine.", "Drive through the floor.", "Lock out at the top."],
  },
  {
    id: "e6",
    name: "Lat Pulldown",
    category: "Back",
    target: "Latissimus Dorsi",
    equipment: "Cable Machine",
    difficulty: "Beginner",
    sets: 4,
    reps: "10-12",
    rest: 60,
    instructions: ["Grip wide.", "Pull the bar to upper chest.", "Control the eccentric."],
  },
  {
    id: "e7",
    name: "Overhead Press",
    category: "Shoulders",
    target: "Deltoids",
    equipment: "Barbell",
    difficulty: "Intermediate",
    sets: 4,
    reps: "8",
    rest: 75,
    instructions: ["Brace the core.", "Press overhead without leaning back.", "Lower to chin level."],
  },
  {
    id: "e8",
    name: "Lateral Raise",
    category: "Shoulders",
    target: "Side Delts",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    sets: 3,
    reps: "15",
    rest: 45,
    instructions: ["Raise arms to shoulder height.", "Keep a slight elbow bend.", "Lower slowly."],
  },
  {
    id: "e9",
    name: "Barbell Curl",
    category: "Biceps",
    target: "Biceps Brachii",
    equipment: "Barbell",
    difficulty: "Beginner",
    sets: 3,
    reps: "10-12",
    rest: 45,
    instructions: ["Keep elbows pinned.", "Curl up without swinging.", "Lower under control."],
  },
  {
    id: "e10",
    name: "Triceps Pushdown",
    category: "Triceps",
    target: "Triceps",
    equipment: "Cable Machine",
    difficulty: "Beginner",
    sets: 3,
    reps: "12",
    rest: 45,
    instructions: ["Elbows tucked.", "Extend fully.", "Return slowly."],
  },
  {
    id: "e11",
    name: "Skull Crushers",
    category: "Triceps",
    target: "Long Head",
    equipment: "EZ Bar",
    difficulty: "Intermediate",
    sets: 3,
    reps: "10",
    rest: 60,
    instructions: ["Lower the bar toward forehead.", "Keep upper arms still.", "Extend to lockout."],
  },
  {
    id: "e12",
    name: "Barbell Squat",
    category: "Legs",
    target: "Quadriceps & Glutes",
    equipment: "Barbell",
    difficulty: "Advanced",
    sets: 4,
    reps: "8",
    rest: 120,
    instructions: ["Bar on upper traps.", "Descend to parallel.", "Drive up through mid-foot."],
  },
  {
    id: "e13",
    name: "Romanian Deadlift",
    category: "Legs",
    target: "Hamstrings",
    equipment: "Barbell",
    difficulty: "Intermediate",
    sets: 3,
    reps: "10",
    rest: 75,
    instructions: ["Soft knees.", "Push hips back.", "Feel the stretch, then stand tall."],
  },
  {
    id: "e14",
    name: "Hanging Leg Raise",
    category: "Abs",
    target: "Lower Abs",
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    sets: 3,
    reps: "12",
    rest: 45,
    instructions: ["Hang with straight arms.", "Raise legs to hip height.", "Avoid swinging."],
  },
  {
    id: "e15",
    name: "Plank",
    category: "Abs",
    target: "Core",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    sets: 3,
    reps: "60 sec",
    rest: 30,
    instructions: ["Elbows under shoulders.", "Squeeze glutes and abs.", "Hold a straight line."],
  },
  {
    id: "e16",
    name: "Treadmill Intervals",
    category: "Cardio",
    target: "Cardiovascular",
    equipment: "Treadmill",
    difficulty: "Intermediate",
    sets: 6,
    reps: "1 min sprint",
    rest: 90,
    instructions: ["Warm up 5 minutes.", "Sprint 60 seconds.", "Walk 90 seconds. Repeat."],
  },
];

export const todaysWorkout: { title: string; duration: number; exercises: WorkoutExercise[] } = {
  title: "Chest + Triceps",
  duration: 45,
  exercises: [
    { exerciseId: "e1", name: "Bench Press", sets: 4, reps: 10, weight: 40, rest: 60 },
    { exerciseId: "e2", name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 16, rest: 60 },
    { exerciseId: "e3", name: "Cable Fly", sets: 3, reps: 12, weight: 12, rest: 45 },
    { exerciseId: "e4", name: "Push-ups", sets: 3, reps: 15, weight: 0, rest: 45 },
  ],
};

export const weeklySplit = [
  { day: "Monday", focus: "Chest + Triceps", exercises: 4 },
  { day: "Tuesday", focus: "Back + Biceps", exercises: 5 },
  { day: "Wednesday", focus: "Legs", exercises: 5 },
  { day: "Thursday", focus: "Shoulders + Abs", exercises: 4 },
  { day: "Friday", focus: "Full Body Strength", exercises: 6 },
  { day: "Saturday", focus: "Cardio + Core", exercises: 3 },
  { day: "Sunday", focus: "Rest & Recovery", exercises: 0 },
];

export const foods: Food[] = [
  { id: "f1", name: "Egg", serving: "1 piece", calories: 70, protein: 6, carbs: 0.6, fat: 5, fiber: 0 },
  { id: "f2", name: "Chicken Breast", serving: "100 g", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: "f3", name: "Rice", serving: "100 g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: "f4", name: "Roti", serving: "1 piece", calories: 104, protein: 3, carbs: 20, fat: 1.5, fiber: 2 },
  { id: "f5", name: "Paneer", serving: "100 g", calories: 265, protein: 18, carbs: 6, fat: 20, fiber: 0 },
  { id: "f6", name: "Dal", serving: "1 bowl", calories: 180, protein: 12, carbs: 25, fat: 3, fiber: 8 },
  { id: "f7", name: "Banana", serving: "1 medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1 },
  { id: "f8", name: "Whey Protein", serving: "1 scoop", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  { id: "f9", name: "Oats", serving: "50 g", calories: 190, protein: 6.5, carbs: 33, fat: 3.5, fiber: 5 },
  { id: "f10", name: "Almonds", serving: "20 g", calories: 116, protein: 4.2, carbs: 4.3, fat: 10, fiber: 2.5 },
  { id: "f11", name: "Greek Yogurt", serving: "150 g", calories: 130, protein: 15, carbs: 8, fat: 4, fiber: 0 },
  { id: "f12", name: "Peanut Butter", serving: "1 tbsp", calories: 95, protein: 4, carbs: 3, fat: 8, fiber: 1 },
];

export const notifications: AppNotification[] = [
  {
    id: "n1",
    title: "Membership expiring soon",
    body: "Your membership expires in 5 days. Renew now to keep your streak alive.",
    time: "2h ago",
    read: false,
    audience: "MEMBER",
    type: "membership",
  },
  {
    id: "n2",
    title: "Workout reminder",
    body: "You haven't logged a workout for 3 days. Today is Chest + Triceps.",
    time: "1d ago",
    read: false,
    audience: "MEMBER",
    type: "workout",
  },
  {
    id: "n3",
    title: "Nutrition target missed",
    body: "Your protein intake was below target yesterday (98g / 140g).",
    time: "2d ago",
    read: true,
    audience: "MEMBER",
    type: "nutrition",
  },
  {
    id: "n4",
    title: "New achievement unlocked",
    body: "7 Day Streak — you earned 150 XP.",
    time: "3d ago",
    read: true,
    audience: "MEMBER",
    type: "achievement",
  },
  {
    id: "n5",
    title: "12 memberships expiring",
    body: "12 memberships expire within the next 7 days. Send renewal reminders.",
    time: "1h ago",
    read: false,
    audience: "ADMIN",
    type: "membership",
  },
  {
    id: "n6",
    title: "Payment pending",
    body: "4 members have pending payments totalling ₹14,700.",
    time: "5h ago",
    read: false,
    audience: "ADMIN",
    type: "payment",
  },
  {
    id: "n7",
    title: "Membership renewed",
    body: "Aman Verma renewed the Premium plan for 6 months.",
    time: "1d ago",
    read: true,
    audience: "ADMIN",
    type: "membership",
  },
];

export const achievements: Achievement[] = [
  { id: "a1", icon: "🔥", title: "7 Day Streak", description: "Trained 7 days in a row", unlocked: true, xp: 150 },
  { id: "a2", icon: "💪", title: "10 Workouts", description: "Completed 10 workouts", unlocked: true, xp: 200 },
  { id: "a3", icon: "🏆", title: "50 Workouts", description: "Completed 50 workouts", unlocked: false, xp: 500 },
  { id: "a4", icon: "🥇", title: "Goal Achieved", description: "Reached your target weight", unlocked: false, xp: 750 },
  { id: "a5", icon: "🥗", title: "Macro Master", description: "Hit macros 14 days straight", unlocked: true, xp: 250 },
  { id: "a6", icon: "⏱️", title: "Early Bird", description: "20 workouts before 7 AM", unlocked: false, xp: 300 },
];

export const leaderboard = [
  { rank: 1, name: "Rahul Sharma", xp: 1250, streak: 7 },
  { rank: 2, name: "Aman Verma", xp: 1180, streak: 5 },
  { rank: 3, name: "Sameer Patel", xp: 1050, streak: 9 },
  { rank: 4, name: "Priya Nair", xp: 980, streak: 4 },
  { rank: 5, name: "Neha Iyer", xp: 910, streak: 3 },
];

export const weightProgress = [
  { date: "Apr", weight: 55, chest: 36, waist: 32, arms: 11.5, thighs: 20 },
  { date: "May", weight: 55.8, chest: 36.5, waist: 31.6, arms: 11.8, thighs: 20.3 },
  { date: "Jun", weight: 56.6, chest: 37, waist: 31.2, arms: 12, thighs: 20.6 },
  { date: "Jul", weight: 57.4, chest: 37.6, waist: 30.6, arms: 12.2, thighs: 21 },
  { date: "Aug", weight: 58, chest: 38, waist: 30, arms: 12.4, thighs: 21.3 },
];

export const workoutPerformance = [
  { week: "W1", bench: 32.5, squat: 45, deadlift: 55, volume: 5400 },
  { week: "W2", bench: 35, squat: 50, deadlift: 60, volume: 5900 },
  { week: "W3", bench: 35, squat: 52.5, deadlift: 65, volume: 6250 },
  { week: "W4", bench: 37.5, squat: 55, deadlift: 70, volume: 6800 },
  { week: "W5", bench: 40, squat: 60, deadlift: 75, volume: 7300 },
];

export const memberAttendanceHistory = [
  { label: "Mon", sessions: 1 },
  { label: "Tue", sessions: 1 },
  { label: "Wed", sessions: 0 },
  { label: "Thu", sessions: 1 },
  { label: "Fri", sessions: 1 },
  { label: "Sat", sessions: 1 },
  { label: "Sun", sessions: 0 },
];

export const nutritionTargets = { calories: 2400, protein: 140, carbs: 300, fat: 70, fiber: 30 };

export const seedMealLog: Record<string, { foodId: string; qty: number }[]> = {
  Breakfast: [
    { foodId: "f1", qty: 3 },
    { foodId: "f9", qty: 1 },
  ],
  Lunch: [
    { foodId: "f3", qty: 2 },
    { foodId: "f2", qty: 1 },
    { foodId: "f6", qty: 1 },
  ],
  Snacks: [
    { foodId: "f8", qty: 1 },
    { foodId: "f10", qty: 1 },
  ],
  Dinner: [
    { foodId: "f4", qty: 3 },
    { foodId: "f5", qty: 1 },
  ],
};
