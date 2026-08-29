import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Flame } from "lucide-react";
import { useState } from "react";
import { MacroBar, PageHeader } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/member/calculator")({
  head: () => ({
    meta: [
      { title: "Calorie Calculator — Smart Gym" },
      { name: "description", content: "Estimate your BMR, TDEE and daily macro split based on age, body stats, activity and goal." },
      { property: "og:title", content: "Calorie Calculator — Smart Gym" },
      { property: "og:description", content: "Estimate BMR, TDEE and daily macros." },
    ],
  }),
  component: CalculatorPage,
});

const activityFactors: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

function CalculatorPage() {
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(58);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("gain");
  const [result, setResult] = useState<{ bmr: number; tdee: number; target: number } | null>(null);

  function calculate() {
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = bmr * (activityFactors[activity] ?? 1.55);
    const target = goal === "lose" ? tdee - 400 : goal === "gain" ? tdee + 400 : tdee;
    setResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target) });
  }

  const protein = result ? Math.round(weight * 1.8) : 0;
  const fat = result ? Math.round((result.target * 0.25) / 9) : 0;
  const carbs = result ? Math.round((result.target - protein * 4 - fat * 9) / 4) : 0;

  return (
    <>
      <PageHeader title="Calorie calculator" description="Mifflin–St Jeor estimate for daily calories and macros" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Activity level</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary — desk job</SelectItem>
                  <SelectItem value="light">Light — 1-3 days/week</SelectItem>
                  <SelectItem value="moderate">Moderate — 3-5 days/week</SelectItem>
                  <SelectItem value="active">Active — 6-7 days/week</SelectItem>
                  <SelectItem value="athlete">Athlete — twice daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Lose fat</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                  <SelectItem value="gain">Build muscle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={calculate}>
              <Calculator className="mr-2 size-4" /> Calculate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your results</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Flame className="mb-3 size-8" />
                <p className="text-sm">Enter your details and hit calculate.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-secondary py-4">
                    <p className="font-display text-xl font-semibold">{result.bmr}</p>
                    <p className="text-xs text-muted-foreground">BMR</p>
                  </div>
                  <div className="rounded-xl bg-secondary py-4">
                    <p className="font-display text-xl font-semibold">{result.tdee}</p>
                    <p className="text-xs text-muted-foreground">TDEE</p>
                  </div>
                  <div className="rounded-xl bg-accent py-4 text-accent-foreground">
                    <p className="font-display text-xl font-semibold">{result.target}</p>
                    <p className="text-xs opacity-80">Target</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <MacroBar label="Protein" value={protein} target={protein} unit="g" colorVar="--color-chart-2" />
                  <MacroBar label="Carbs" value={carbs} target={carbs} unit="g" colorVar="--color-chart-3" />
                  <MacroBar label="Fat" value={fat} target={fat} unit="g" colorVar="--color-chart-4" />
                </div>
                <p className="text-xs text-muted-foreground">
                  These numbers are estimates only and not medical advice. Consult a certified nutritionist before making
                  major dietary changes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
